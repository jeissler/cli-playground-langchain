import { ChatPromptTemplate } from '@langchain/core/prompts'
import { pull } from 'langchain/hub'

const ragPrompt = await pull('rlm/rag-prompt')

export const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    'You are a helpful assitant and should respond in this {language}. Be friendly and concise.'
  ],
  ['placeholder', '{messages}'],
  ...ragPrompt.promptMessages
])
