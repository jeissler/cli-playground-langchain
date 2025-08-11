import 'cheerio'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

const selectors = ['p', 'h1', 'h2']

export async function fetchDocs(urls) {
  const loaded = []
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })

  for (const url of urls) {
    const loader = new CheerioWebBaseLoader(url, {
      selector: selectors.join(', ')
    })
    const doc = await loader.load()
    const splits = await splitter.splitDocuments(doc)
    loaded.push(...splits)
  }

  return loaded
}
