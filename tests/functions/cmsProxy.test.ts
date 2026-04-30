import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// @ts-ignore JS module
import { onRequestGet, onRequestOptions } from '../../functions/api/cms/[[path]].js'

function ctx(path: string | string[], env: Record<string, string> = { CMS_PUBLIC_SERVER_URL: 'https://cms.test' }, search = '') {
  return {
    request: new Request(`https://x.test/api/cms/${Array.isArray(path) ? path.join('/') : path}${search}`),
    env,
    params: { path },
  }
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    ),
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('functions/api/cms/[[path]]', () => {
  it('forwards GET to CMS with joined path', async () => {
    await onRequestGet(ctx(['pages', 'about']))
    const calls = (globalThis.fetch as any).mock.calls
    expect(calls[0][0]).toBe('https://cms.test/api/pages/about')
  })

  it('preserves the query string', async () => {
    await onRequestGet(ctx('pages', undefined, '?slug=about&locale=en'))
    const calls = (globalThis.fetch as any).mock.calls
    expect(calls[0][0]).toContain('?slug=about&locale=en')
  })

  it('returns 500 when CMS_PUBLIC_SERVER_URL is missing', async () => {
    const res = (await onRequestGet(ctx('pages', {} as any))) as Response
    expect(res.status).toBe(500)
  })

  it('OPTIONS returns CORS headers', async () => {
    const res = (await onRequestOptions()) as Response
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})
