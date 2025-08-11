import { ChatOpenAI } from '@langchain/openai'
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
  Annotation
} from '@langchain/langgraph'
import { HumanMessage } from '@langchain/core/messages'
import { promptTemplate } from './prompt.js'
import { trimmer } from './utils.js'
import { getConfig, getLanguage } from './session.js'

// Setup LLM
const llm = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0
})
const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  language: Annotation()
})

// Core node
const callModel = async (state) => {
  const trimmedMessage = await trimmer.invoke(state.messages)
  const prompt = await promptTemplate.invoke({
    messages: trimmedMessage,
    language: state.language
  })
  const response = await llm.invoke(prompt)
  return { messages: [response] }
}

// Graph setup
const memory = new MemorySaver()
const workflow = new StateGraph(GraphAnnotation)
  .addNode('model', callModel)
  .addEdge(START, 'model')
  .addEdge('model', END)
const app = workflow.compile({ checkpointer: memory })

// Main method
export async function chat(msg) {
  const input = {
    messages: [new HumanMessage(msg)],
    language: getLanguage()
  }
  const output = await app.invoke(input, getConfig())
  return output.messages[output.messages.length - 1].content.trim()
}

export async function getHistory() {
  const checkpoint = await memory.get(getConfig())
  const messages = checkpoint?.channel_values?.messages || []
  return messages.filter((msg) => msg instanceof HumanMessage)
}
