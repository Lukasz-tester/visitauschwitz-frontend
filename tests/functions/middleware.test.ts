import { describe, expect, it, vi } from 'vitest'
// @ts-ignore JS module
import { onRequest } from '../../functions/_middleware.js'

function ctx(url: string, opts: { country?: string; acceptLanguage?: string } = {}) {
  const headers = new Headers()
  if (opts.acceptLanguage) headers.set('Accept-Language', opts.acceptLanguage)
  const request = Object.assign(new Request(url, { headers }), {
    cf: opts.country ? { country: opts.country } : undefined,
  })
  return { request, next: vi.fn(async () => new Response('ok', { status: 200 })) }
}

describe('functions/_middleware locale redirect', () => {
  it('redirects "/" to /en/ by default', async () => {
    const c = ctx('https://x.test/')
    const res = (await onRequest(c)) as Response
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('https://x.test/en/')
  })

  it('redirects "/" to /pl/ for Polish country header', async () => {
    const c = ctx('https://x.test/', { country: 'PL' })
    const res = (await onRequest(c)) as Response
    expect(res.headers.get('Location')).toBe('https://x.test/pl/')
  })

  it('honors Accept-Language', async () => {
    const c = ctx('https://x.test/', { acceptLanguage: 'pl,en;q=0.8' })
    const res = (await onRequest(c)) as Response
    expect(res.headers.get('Location')).toBe('https://x.test/pl/')
  })

  it('passes through paths already prefixed with a locale', async () => {
    const c = ctx('https://x.test/en/about')
    await onRequest(c)
    expect(c.next).toHaveBeenCalled()
  })

  it('passes through /api/* paths', async () => {
    const c = ctx('https://x.test/api/contact')
    await onRequest(c)
    expect(c.next).toHaveBeenCalled()
  })

  it('passes through /_next/* paths', async () => {
    const c = ctx('https://x.test/_next/static/x.js')
    await onRequest(c)
    expect(c.next).toHaveBeenCalled()
  })

  it('passes through file paths with extensions', async () => {
    const c = ctx('https://x.test/sitemap.xml')
    await onRequest(c)
    expect(c.next).toHaveBeenCalled()
  })

  it('redirects unprefixed nested path with locale prefix', async () => {
    const c = ctx('https://x.test/about', { country: 'PL' })
    const res = (await onRequest(c)) as Response
    expect(res.headers.get('Location')).toBe('https://x.test/pl/about')
  })
})
