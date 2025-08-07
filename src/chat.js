import 'dotenv/config'
import { v4 as uuidv4 } from 'uuid'
import { ChatOpenAI } from '@langchain/openai'
import { START, END, MessagesAnnotation, StateGraph, MemorySaver } from '@langchain/langgraph'

const config = { configurable: { thread_id: uuidv4() } }
const llm = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0
})

async function callModel(state) {
  const response = await llm.invoke(state.messages)
  return { messages: response }
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('model', callModel)
  .addEdge(START, 'model')
  .addEdge('model', END)

const memory = new MemorySaver()
const app = workflow.compile({ checkpointer: memory })

export async function chat(input) {
  const output = await app.invoke({ messages: input }, config)
  return output.messages[output.messages.length - 1].content.trim()
}
