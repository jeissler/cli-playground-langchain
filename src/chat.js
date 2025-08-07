import 'dotenv/config'
import { v4 as uuidv4 } from 'uuid'
import { ChatOpenAI } from '@langchain/openai'
import { START, END, MessagesAnnotation, StateGraph, MemorySaver } from '@langchain/langgraph'

const defaultId = uuidv4()
const config = { configurable: { thread_id: defaultId } }
const llm = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0
})

const callModel = async (state) => {
  const response = await llm.invoke(state.messages)
  return { messages: response }
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('model', callModel)
  .addEdge(START, 'model')
  .addEdge('model', END)

const knownUserIds = [defaultId]
const memory = new MemorySaver()
const app = workflow.compile({ checkpointer: memory })

export function setUserId(id = uuidv4()) {
  config.configurable.user_id = id
  if (!knownUserIds.includes(id)) knownUserIds.push(id)
  return id
}

export function getKnowUsers() {
  return [...knownUserIds]
}

export async function chat(input) {
  const output = await app.invoke({ messages: input }, config)
  return output.messages[output.messages.length - 1].content.trim()
}
