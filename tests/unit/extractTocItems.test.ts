import { describe, expect, it } from 'vitest'
import { extractTocItems } from '@/utilities/extractTocItems'

const heading = (tag: 'h1' | 'h2' | 'h3', text: string) => ({
  tag,
  children: [{ text }],
})
const richText = (...nodes: any[]) => ({ root: { children: nodes } })

describe('extractTocItems', () => {
  it('returns empty array for empty input', () => {
    expect(extractTocItems([])).toEqual([])
  })

  it('extracts h1 from hero richText as a divider entry', () => {
    const items = extractTocItems([], { richText: richText(heading('h1', 'Welcome')) } as any)
    expect(items[0]).toMatchObject({ id: '_hero', label: 'Welcome', divider: true })
  })

  it('extracts content block heading from `heading` field', () => {
    const items = extractTocItems([
      {
        blockName: 'intro',
        blockType: 'content',
        heading: richText(heading('h2', 'Introduction')),
      } as any,
    ])
    expect(items).toEqual([{ id: 'intro', label: 'Introduction', indent: false }])
  })

  it('treats h3 as indented', () => {
    const items = extractTocItems([
      {
        blockName: 'sub',
        blockType: 'content',
        heading: richText(heading('h3', 'Sub topic')),
      } as any,
    ])
    expect(items[0]?.indent).toBe(true)
  })

  it('falls back to columns richText if `heading` field has none', () => {
    const items = extractTocItems([
      {
        blockName: 'col',
        blockType: 'content',
        heading: richText(),
        columns: [{ richText: richText(heading('h2', 'From columns')) }],
      } as any,
    ])
    expect(items[0]?.label).toBe('From columns')
  })

  it('skips blocks without blockName', () => {
    const items = extractTocItems([
      { blockType: 'content', heading: richText(heading('h2', 'Nope')) } as any,
    ])
    expect(items).toEqual([])
  })

  it('extracts accordion first-question label', () => {
    const items = extractTocItems([
      {
        blockName: 'faq',
        blockType: 'accordion',
        accordionItems: [{ question: 'Q1?' }, { question: 'Q2?' }],
      } as any,
    ])
    expect(items).toEqual([{ id: 'faq', label: 'Q1?' }])
  })
})
