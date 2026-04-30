import { describe, expect, it } from 'vitest'
import { formatMetaTitle } from '@/utilities/formatMetaTitle'

describe('formatMetaTitle', () => {
  const year = new Date().getFullYear()

  it('appends the current year for pages', () => {
    expect(formatMetaTitle('About')).toBe(`About | ${year}`)
  })

  it('omits the year for posts', () => {
    expect(formatMetaTitle('Post Title', true)).toBe('Post Title')
  })

  it('returns a default title with year when raw title is missing', () => {
    expect(formatMetaTitle(undefined)).toBe(`Auschwitz Visitor Information | ${year}`)
  })
})
