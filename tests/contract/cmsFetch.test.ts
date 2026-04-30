import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server, CMS_URL } from '../helpers/mockCms'
import { pageFixture } from '../fixtures/page'

beforeAll(() => {
  process.env.CMS_PUBLIC_SERVER_URL = CMS_URL
  process.env.USE_LOCAL_CMS = 'true'
  server.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('cmsFetchJSON', () => {
  it('returns parsed JSON on success', async () => {
    const { cmsFetchJSON } = await import('@/utilities/cmsFetch')
    const data = await cmsFetchJSON<any>('/api/pages?where[slug][equals]=about&locale=en&depth=2')
    expect(data?.docs?.[0]?.slug).toBe(pageFixture.slug)
  })

  it('returns null when CMS responds with 500 (after retries)', async () => {
    server.use(http.get(`${CMS_URL}/api/pages`, () => HttpResponse.json({}, { status: 500 })))
    const { cmsFetch } = await import('@/utilities/cmsFetch')
    // cmsFetch (not JSON) returns null after exhausting retries
    const res = await cmsFetch('/api/pages?where[slug][equals]=about', 1)
    expect(res).toBeNull()
  }, 10000)

  it('throttles concurrent requests but still resolves all of them', async () => {
    const { cmsFetchJSON } = await import('@/utilities/cmsFetch')
    const results = await Promise.all(
      Array.from({ length: 6 }, () =>
        cmsFetchJSON<any>('/api/pages?where[slug][equals]=about&locale=en'),
      ),
    )
    expect(results).toHaveLength(6)
    for (const r of results) expect(r?.docs?.[0]?.slug).toBe(pageFixture.slug)
  })
})
