import { trimMessages } from '@langchain/core/messages'

export const trimmer = trimMessages({
  maxTokens: 10,
  strategy: 'last',
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: 'human'
})

export function extractLinks(link) {
  const urlRegex = /@(?:https?:\/\/)?[^\s]+/gi
  return (link.match(urlRegex) || []).map((link) => {
    let clean = link.slice(1) // remove '@'
    if (!/^https?:\/\//i.test(clean)) {
      clean = `https://${clean}`
    }
    return clean
  })
}
