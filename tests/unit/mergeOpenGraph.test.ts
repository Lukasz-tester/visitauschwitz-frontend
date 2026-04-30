import { describe, expect, it } from 'vitest'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

describe('mergeOpenGraph', () => {
  it('returns defaults when no override is provided', () => {
    const og = mergeOpenGraph() as any
    expect(og?.type).toBe('website')
    expect(og?.siteName).toBe('Auschwitz Visiting Guide')
    expect(Array.isArray(og?.images)).toBe(true)
  })

  it('overrides scalar fields', () => {
    const og = mergeOpenGraph({ title: 'Custom Title', description: 'Custom desc' })
    expect(og?.title).toBe('Custom Title')
    expect(og?.description).toBe('Custom desc')
  })

  it('uses override images when provided', () => {
    const og = mergeOpenGraph({ images: [{ url: '/custom.jpg' }] })
    expect(og?.images).toEqual([{ url: '/custom.jpg' }])
  })

  it('falls back to default images when override has none', () => {
    const og = mergeOpenGraph({ title: 'X' })
    expect(Array.isArray(og?.images)).toBe(true)
    expect((og?.images as any[])[0]).toHaveProperty('url')
  })
})
