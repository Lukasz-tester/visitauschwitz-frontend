import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// @ts-ignore JS module
import { onRequestPost } from '../../functions/api/subscribe.js'

function ctx(body: any, env: Record<string, string> = { CMS_PUBLIC_SERVER_URL: 'https://cms.test' }) {
  return {
    request: new Request('https://x.test/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    env,
  }
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 })),
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('functions/api/subscribe', () => {
  it('honeypot succeeds silently without calling CMS', async () => {
    const res = (await onRequestPost(ctx({ email: 'a@b.c', _hp_company: 'bot' }))) as Response
    expect(res.status).toBe(200)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('rejects invalid email', async () => {
    const res = (await onRequestPost(ctx({ email: 'nope' }))) as Response
    expect(res.status).toBe(400)
  })

  it('proxies to CMS with email + locale', async () => {
    const res = (await onRequestPost(ctx({ email: 'user@x.com', locale: 'pl' }))) as Response
    expect(res.status).toBe(200)
    const calls = (globalThis.fetch as any).mock.calls
    expect(calls[0][0]).toBe('https://cms.test/api/subscribe')
    expect(JSON.parse(calls[0][1].body)).toEqual({ email: 'user@x.com', locale: 'pl' })
  })

  it('returns 500 when CMS_PUBLIC_SERVER_URL is missing', async () => {
    const res = (await onRequestPost(ctx({ email: 'user@x.com' }, {} as any))) as Response
    expect(res.status).toBe(500)
  })
})
