import 'dotenv/config'
import { v4 as uuidv4 } from 'uuid'
import { ChatOpenAI } from '@langchain/openai'
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
  Annotation
} from '@langchain/langgraph'
import { HumanMessage, trimMessages } from '@langchain/core/messages'
import { promptTemplate } from './promptTemplate.js'

let language = 'english'
const defaultId = uuidv4()
const config = { configurable: { thread_id: defaultId } }
const llm = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0
})
const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  language: Annotation()
})

const trimmer = trimMessages({
  maxTokens: 10,
  strategy: 'last',
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: 'human'
})

const callModel = async (state) => {
  const trimmedMessage = await trimmer.invoke(state.messages)
  const prompt = await promptTemplate.invoke({
    messages: trimmedMessage,
    language: state.language
  })
  const response = await llm.invoke(prompt)
  return { messages: [response] }
}

const workflow = new StateGraph(GraphAnnotation)
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

export function setLanguage(lang) {
  language = lang
}

export async function chat(msg) {
  const input = {
    messages: [new HumanMessage(msg)],
    language
  }
  const output = await app.invoke(input, config)
  return output.messages[output.messages.length - 1].content.trim()
}
