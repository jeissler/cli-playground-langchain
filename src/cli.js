import { input, select } from '@inquirer/prompts'
import chalk from 'chalk'

export async function promptUser() {
  try {
    return await input({ message: chalk.green('You') })
  } catch (error) {
    // inquirer throws ExitPromptError on CTL+C
    if (error.name === 'ExitPromptError') return 'exit'
    throw error
  }
}

export async function promptSelect(message, choices) {
  return await select({
    message: chalk.cyan(message),
    choices: choices.map((value) => ({ name: value, value }))
  })
}

export function printResponse(res) {
  console.log(chalk.cyan('Brane:'), res, '\n')
}
