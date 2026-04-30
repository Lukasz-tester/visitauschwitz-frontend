import { describe, expect, it } from 'vitest'
import { withTrailingSlash } from '@/utilities/withTrailingSlash'

describe('withTrailingSlash', () => {
  it('appends a trailing slash to a bare path', () => {
    expect(withTrailingSlash('/about')).toBe('/about/')
  })

  it('keeps already-trailing-slashed paths', () => {
    expect(withTrailingSlash('/about/')).toBe('/about/')
  })

  it('preserves query strings', () => {
    expect(withTrailingSlash('/posts?page=2')).toBe('/posts/?page=2')
  })

  it('preserves hash fragments', () => {
    expect(withTrailingSlash('/about#team')).toBe('/about/#team')
  })

  it('does not touch absolute URLs', () => {
    expect(withTrailingSlash('https://example.com/x')).toBe('https://example.com/x')
    expect(withTrailingSlash('//cdn.example.com/x')).toBe('//cdn.example.com/x')
  })

  it('does not touch hash-only links', () => {
    expect(withTrailingSlash('#top')).toBe('#top')
  })

  it('skips api and _next paths', () => {
    expect(withTrailingSlash('/api/contact')).toBe('/api/contact')
    expect(withTrailingSlash('/_next/static/x')).toBe('/_next/static/x')
  })

  it('returns falsy input unchanged', () => {
    expect(withTrailingSlash('')).toBe('')
  })
})
