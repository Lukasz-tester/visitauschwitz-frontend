import type { Page as PageType } from '@/payload-types'
import type { TocItem } from '@/components/TableOfContents'

type Block = PageType['layout'][0]

function extractText(node: any): string {
  if (node.text) return node.text
  if (node.children) return node.children.map(extractText).join('')
  return ''
}

/** Find the first h2 or h3 node in a rich-text root and return its text + tag */
function findFirstHeading(
  rt: { root?: { children?: any[] } } | null | undefined,
): { text: string; tag: string } | null {
  if (!Array.isArray(rt?.root?.children)) return null
  for (const node of rt.root.children) {
    if (node.tag === 'h2' || node.tag === 'h3') {
      const text = extractText(node).trim()
      if (text) return { text, tag: node.tag }
    }
  }
  return null
}

export function extractTocItems(
  blocks: Block[],
  hero?: PageType['hero'],
): TocItem[] {
  if (!blocks) return []

  const items: TocItem[] = []

  // Extract h1 from hero richText
  if (Array.isArray(hero?.richText?.root?.children)) {
    for (const node of hero.richText.root.children) {
      if (node.tag === 'h1') {
        const text = extractText(node).trim()
        if (text) {
          items.push({ id: '_hero', label: text, divider: true })
          break
        }
      }
    }
  }

  for (const block of blocks) {
    if (!block.blockName) continue

    if (block.blockType === 'content') {
      // Try heading field first
      let found = 'heading' in block ? findFirstHeading(block.heading) : null

      // Fall back to columns richText and richTextEnd
      if (!found && 'columns' in block && Array.isArray(block.columns)) {
        for (const col of block.columns) {
          found = findFirstHeading(col.richText)
          if (found) break
          found = findFirstHeading((col as any).richTextEnd)
          if (found) break
        }
      }

      if (!found) continue
      items.push({
        id: block.blockName,
        label: found.text,
        indent: found.tag === 'h3',
      })
    } else if (block.blockType === 'cta') {
      if (!('tiles' in block) || !Array.isArray(block.tiles)) continue
      if (block.tiles.length !== 1) continue
      if (block.blockName === 'Quotation') continue

      const tile = block.tiles[0]

      // Try h2/h3 heading inside tile richText
      const found = findFirstHeading((tile as any).richText)
      if (found) {
        items.push({
          id: block.blockName,
          label: found.text,
          indent: found.tag === 'h3',
        })
      } else if (tile.title) {
        items.push({ id: block.blockName, label: tile.title })
      }
    } else if (block.blockType === 'bankTransfer') {
      const found = findFirstHeading((block as any).heading)
      if (!found) continue
      items.push({ id: block.blockName, label: found.text, indent: found.tag === 'h3' })
    } else if (block.blockType === 'oh') {
      const found = findFirstHeading((block as any).richText)
      if (!found) continue
      items.push({ id: block.blockName, label: found.text, indent: found.tag === 'h3' })
    } else if (block.blockType === 'accordion') {
      const accordionItems = (block as any).accordionItems
      const label = Array.isArray(accordionItems) && accordionItems[0]?.question
      if (!label) continue
      items.push({ id: block.blockName, label })
    }
  }

  return items
}
