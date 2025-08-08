import { v4 as uuidv4 } from 'uuid'

const defaultId = uuidv4()

const state = {
  thread_id: defaultId,
  language: 'english',
  knownUserIds: [defaultId]
}

export function getConfig() {
  return { configurable: { thread_id: state.thread_id } }
}

export function setLanguage(lang) {
  state.language = lang
}

export function getLanguage() {
  return state.language
}

export function setUserId(id = uuidv4()) {
  state.thread_id = id
  if (!state.knownUserIds.includes(id)) state.knownUserIds.push(id)
  return id
}

export function getKnowUsers() {
  return [...state.knownUserIds]
}
