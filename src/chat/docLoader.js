import 'cheerio'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

const selectors = ['p', 'h1', 'h2']

const loader = new CheerioWebBaseLoader('https://prosemirror.net/docs/guide/', {
  selector: selectors.join(', ')
})

const doc = await loader.load()

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chuckOverlap: 200
})

export const allSplits = await splitter.splitDocuments(doc)
