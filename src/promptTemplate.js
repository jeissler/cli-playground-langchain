import { ChatPromptTemplate } from '@langchain/core/prompts'

export const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    'You are a helpful assitant and should respond in this {language}. Be friendly and concise.'
  ],
  ['placeholder', '{messages}']
])
