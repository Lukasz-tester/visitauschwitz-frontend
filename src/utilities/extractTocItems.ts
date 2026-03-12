import type { Page as PageType } from '@/payload-types'
import type { TocItem } from '@/components/TableOfContents'

type Block = PageType['layout'][0]

function extractText(node: any): string {
  if (node.text) return node.text
  if (node.children) return node.children.map(extractText).join('')
  return ''
}

function extractFirstText(richText: { root?: { children?: any[] } } | null | undefined): string {
  const firstChild = richText?.root?.children?.[0]
  if (!firstChild) return ''
  return extractText(firstChild).trim()
}

function truncate(text: string, max = 50): string {
  return text.length > max ? text.slice(0, max - 3) + '...' : text
}

export function extractTocItems(blocks: Block[]): TocItem[] {
  if (!blocks) return []

  const items: TocItem[] = []

  for (const block of blocks) {
    if (!block.blockName) continue

    if (block.blockType === 'content') {
      // Try heading first
      let text = 'heading' in block ? extractFirstText(block.heading) : ''

      // Fall back to first column's richText
      if (!text && 'columns' in block && Array.isArray(block.columns)) {
        for (const col of block.columns) {
          text = extractFirstText(col.richText)
          if (text) break
        }
      }

      if (!text) continue
      items.push({ id: block.blockName, label: truncate(text) })
    } else if (block.blockType === 'cta') {
      if (!('tiles' in block) || !Array.isArray(block.tiles)) continue
      if (block.tiles.length !== 1) continue

      const tile = block.tiles[0]
      if (!tile.title || tile.title === 'Quotation') continue

      items.push({ id: block.blockName, label: truncate(tile.title) })
    }
    // All other block types are skipped
  }

  return items
}
