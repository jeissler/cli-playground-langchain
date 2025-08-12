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

// App state
const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  question: Annotation(),
  context: Annotation(),
  answer: Annotation(),
  language: Annotation()
  // TODO: add original query, reformulated query?
})

// RAG pipeline
const reformulate = async (state) => {
  const prompt = `Reframe the query so you can best answer it: "${state.question}"`
  const res = await llm.invoke(prompt)
  return { question: res.content.trim() }
}

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
  .addNode('reformulate', reformulate)
  .addNode('retrieve', retrieve)
  .addNode('generate', generate)
  .addEdge(START, 'reformulate')
  .addEdge('reformulate', 'retrieve')
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

export async function addDocs(docs) {
  if (docs.length) await vectorStore.addDocuments(docs)
}
