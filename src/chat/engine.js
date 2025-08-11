import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import {
  START,
  END,
  StateGraph,
  MemorySaver,
  Annotation,
  MessagesAnnotation
} from '@langchain/langgraph'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { HumanMessage } from '@langchain/core/messages'
import { promptTemplate } from './prompt.js'
import { trimmer } from './utils.js'
import { getConfig, getLanguage } from './session.js'
import { allSplits } from './docLoader.js'

// Setup LLM
const llm = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0
})

// User/message memory store
const memory = new MemorySaver()

// RAG storage
const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-large' })
const vectorStore = new MemoryVectorStore(embeddings)
await vectorStore.addDocuments(allSplits)

// App state
const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  question: Annotation(),
  context: Annotation(),
  answer: Annotation(),
  language: Annotation()
})

// RAG pipeline
const retrieve = async (state) => {
  const docs = await vectorStore.similaritySearch(state.question)
  return { context: docs }
}

const generate = async (state) => {
  const trimmedMessages = await trimmer.invoke(state.messages)
  const content = state.context.map((doc) => doc.pageContent).join('\n')
  const messages = await promptTemplate.invoke({
    messages: trimmedMessages,
    question: state.question,
    context: content,
    language: getLanguage()
  })
  const res = await llm.invoke(messages)
  return { answer: res.content }
}

// Compile app
const graph = new StateGraph(StateAnnotation)
  .addNode('retrieve', retrieve)
  .addNode('generate', generate)
  .addEdge(START, 'retrieve')
  .addEdge('retrieve', 'generate')
  .addEdge('generate', END)
const app = graph.compile({ checkpointer: memory })

// Public methods
export async function chat(msg) {
  const res = await app.invoke({ question: msg, messages: [new HumanMessage(msg)] }, getConfig())
  return res.answer
}

export async function getHistory() {
  const checkpoint = await memory.get(getConfig())
  const messages = checkpoint?.channel_values?.messages || []
  return messages.filter((msg) => msg instanceof HumanMessage)
}
