import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// @ts-expect-error JS module
import { onRequestPost, onRequestOptions } from '../../functions/api/contact.js'

function ctx(body: any, env: Record<string, string> = {}) {
  return {
    request: new Request('https://x.test/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    env: {
      RESEND_API_KEY: 'test-key',
      EMAIL_FROM: 'test@from',
      EMAIL_TO: 'test@to',
      CMS_PUBLIC_SERVER_URL: 'https://cms.test',
      ...env,
    },
  }
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('resend.com')) {
        return new Response(JSON.stringify({ id: 'resend-id' }), { status: 200 })
      }
      if (url.includes('/api/subscribe')) {
        return new Response(JSON.stringify({ success: true }), { status: 200 })
      }
      return new Response('', { status: 404 })
    }),
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('functions/api/contact', () => {
  it('OPTIONS returns CORS headers', async () => {
    const res = (await onRequestOptions()) as Response
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('returns success silently for honeypot submissions', async () => {
    const res = (await onRequestPost(
      ctx({ email: 'spam@x', _hp_company: 'bot', message: 'msg' }),
    )) as Response
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('rejects missing or invalid email', async () => {
    const r1 = (await onRequestPost(ctx({ email: '' }))) as Response
    expect(r1.status).toBe(400)
    const r2 = (await onRequestPost(ctx({ email: 'not-an-email' }))) as Response
    expect(r2.status).toBe(400)
  })

  it('contact flow: sends two Resend emails when message is provided', async () => {
    const res = (await onRequestPost(
      ctx({ email: 'user@x.com', name: 'User', message: 'Hello' }),
    )) as Response
    expect(res.status).toBe(200)
    expect((globalThis.fetch as any).mock.calls.length).toBe(2)
    const urls = (globalThis.fetch as any).mock.calls.map((c: any[]) => c[0])
    for (const u of urls) expect(u).toContain('resend.com')
  })

  it('newsletter flow: proxies to CMS when no message is provided', async () => {
    const res = (await onRequestPost(ctx({ email: 'user@x.com', locale: 'pl' }))) as Response
    expect(res.status).toBe(200)
    const calls = (globalThis.fetch as any).mock.calls
    expect(calls.length).toBe(1)
    expect(calls[0][0]).toContain('/api/subscribe')
    expect(JSON.parse(calls[0][1].body)).toEqual({ email: 'user@x.com', locale: 'pl' })
  })

  it('returns 500 when CMS_PUBLIC_SERVER_URL is missing for newsletter flow', async () => {
    const res = (await onRequestPost(
      ctx({ email: 'user@x.com' }, { CMS_PUBLIC_SERVER_URL: '' }),
    )) as Response
    expect(res.status).toBe(500)
  })

  it('returns 500 when Resend reports failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('boom', { status: 500 })),
    )
    const res = (await onRequestPost(
      ctx({ email: 'user@x.com', message: 'Hi' }),
    )) as Response
    expect(res.status).toBe(500)
  })
})
