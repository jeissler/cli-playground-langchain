import chalk from 'chalk'
import { promptUser, printResponse } from './cli.js'

async function run() {
  console.log('\nBrane CLI\nType "exit" to quit or "CTL+C"\n')

  while (true) {
    const input = await promptUser()

    if (input.toLowerCase() === 'exit') {
      console.log(chalk.yellow('Exiting...'))
      process.exit(0)

      break
    }

    const response = `Input was: ${input}`

    printResponse(response)
  }
}

run()
