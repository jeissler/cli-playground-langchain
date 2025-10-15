import 'dotenv/config'
import chalk from 'chalk'
import { promptUser, printResponse, promptSelect } from './cli.js'
import {
  addDocs,
  chat,
  fetchDocs,
  getHistory,
  getKnowUsers,
  setUserId,
  setLanguage
} from './chat/index.js'
import { extractLinks } from './chat/utils.js'

async function run() {
  console.log(chalk.green.bold('\nBrane CLI\nType "exit" to quit or "CTL+C"\n'))

  while (true) {
    const input = await promptUser()
    const cmd = input.toLowerCase().trim()

    if (cmd === 'exit') {
      console.log(chalk.yellow('Exiting...'))
      process.exit(0)

      break
    }

    if (cmd === 'users') {
      const users = getKnowUsers()
      const select = await promptSelect('Select a user:', users)

      setUserId(select)

      continue
    }

    if (cmd === 'new') {
      const id = setUserId()
      console.log(chalk.green(`New user created with ID: ${id}`))

      continue
    }

    if (cmd === 'lang') {
      const languages = ['english', 'spanish', 'french', 'german', 'portuguese']
      const selectedLang = await promptSelect('Select a language:', languages)

      setLanguage(selectedLang)
      console.log(chalk.green(`Language set to: ${selectedLang}`))

      continue
    }

    if (cmd === 'history') {
      const messages = await getHistory()

      if (messages.length === 0) {
        console.log(chalk.yellow('No chat history found.'))
      } else {
        messages.forEach((msg) => console.log(chalk.cyan(msg.content)))
      }

      continue
    }

    if (cmd.includes('@')) {
      try {
        const links = extractLinks(cmd)
        const docs = await fetchDocs(links)

        if (docs.length) {
          await addDocs(docs)
          console.log(chalk.green('Loaded into memory:'))
          links.forEach((link) => console.log(chalk.green(`${link}\n`)))
        }
      } catch (e) {
        console.log(chalk.red(`${e.message} for ${cmd.substring(1)}`))
      }
    }

    console.log(chalk.cyan('Thinking...'), '\n')

    const response = await chat(input)

    printResponse(response)
  }
}

run()
