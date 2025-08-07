import chalk from 'chalk'
import { promptUser, printResponse, promptSelect } from './cli.js'
import { chat, getKnowUsers, setUserId } from './chat.js'

async function run() {
  console.log('\nBrane CLI\nType "exit" to quit or "CTL+C"\n')

  while (true) {
    const input = await promptUser()

    if (input.toLowerCase() === 'exit') {
      console.log(chalk.yellow('Exiting...'))
      process.exit(0)

      break
    }

    if (input.toLowerCase() === 'users') {
      const users = getKnowUsers()
      const select = await promptSelect('Select a user:', users)

      setUserId(select)

      continue
    }

    if (input.toLowerCase() === 'new user') {
      const id = setUserId()
      console.log(chalk.green(`New user created with ID: ${id}`))

      continue
    }

    const response = await chat(input)

    printResponse(response)
  }
}

run()
