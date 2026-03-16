export function getCookie(name) {
  if (typeof document === 'undefined') return null
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export const removeSpecialChars = (text: string): string =>
  text
    .replace(/\p{Extended_Pictographic}/gu, '')    // all emoji pictographs (🕒, 🚾, 😀, etc.)
    .replace(/[\u200B-\u200D\uFE0E\uFE0F]/g, '')  // zero-width chars & variation selectors
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')     // strip any remaining non-text symbols
    .replace(/\s+/g, ' ')
    .trim();


const IS_BOLD = 1
const IS_ITALIC = 1 << 1

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function serializeNodesToHtml(children: any[]): string {
  return children
    .map((node) => {
      if (node.type === 'text') {
        let html = escapeHtml(node.text)
        if (node.format & IS_BOLD) html = `<strong>${html}</strong>`
        if (node.format & IS_ITALIC) html = `<em>${html}</em>`
        return html
      }
      if (node.type === 'linebreak') return '<br>'

      const inner = node.children ? serializeNodesToHtml(node.children) : ''

      switch (node.type) {
        case 'paragraph':
          return `<p>${inner}</p>`
        case 'heading':
          return `<${node.tag}>${inner}</${node.tag}>`
        case 'list':
          return `<${node.tag}>${inner}</${node.tag}>`
        case 'listitem':
          return `<li>${inner}</li>`
        case 'link':
          return node.fields?.url ? `<a href="${escapeHtml(node.fields.url)}">${inner}</a>` : inner
        case 'quote':
          return `<p>${inner}</p>`
        default:
          return inner
      }
    })
    .join('')
}

/** Convert Lexical rich text JSON to basic HTML (for structured data like FAQ schema). */
export function richTextToHtml(richText: any): string {
  if (!richText?.root?.children?.length) return ''
  return serializeNodesToHtml(richText.root.children)
}

export const extractTextFromRichText = (richText: any, maxLength: number = 250) => {
  if (!richText || !richText.root || !Array.isArray(richText.root.children)) {
    return ''
  }

  // Recursively extract text from children
  const extractText = (children: any[]): string => {
    return children
      .map((child) => {
        if (child.text) {
          return child.text
        }
        // If there are nested children, recurse to extract their text
        if (child.children) {
          return extractText(child.children)
        }
        return ''
      })
      .join(' ') // Join text nodes with space
  }

  const fullText = extractText(richText.root.children)

  // If the text is short enough, return it as is
  if (fullText.length <= maxLength) {
    return fullText
  }

  // Truncate the text at the maximum length and ensure it ends at a sentence boundary
  const truncatedText = fullText.slice(0, maxLength)
  const lastSpaceIndex = truncatedText.lastIndexOf(' ')
  let truncatedSentence = truncatedText.slice(0, lastSpaceIndex)

  // Ensure it ends at a punctuation mark
  const sentenceEndIndex = Math.max(
    truncatedSentence.lastIndexOf('.'),
    truncatedSentence.lastIndexOf('?'),
    truncatedSentence.lastIndexOf('!'),
  )

  if (sentenceEndIndex !== -1) {
    truncatedSentence = truncatedSentence.slice(0, sentenceEndIndex + 1)
  }

  // Add ellipsis if truncation occurred
  return truncatedSentence + '...'
}
