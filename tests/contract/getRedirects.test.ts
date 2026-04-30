import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server, CMS_URL } from '../helpers/mockCms'

beforeAll(() => {
  process.env.CMS_PUBLIC_SERVER_URL = CMS_URL
  process.env.USE_LOCAL_CMS = 'true'
  server.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getRedirects', () => {
  it('returns the docs array', async () => {
    const { getRedirects } = await import('@/utilities/getRedirects')
    const redirects = await getRedirects()
    expect(redirects).toHaveLength(1)
    expect(redirects[0]).toMatchObject({ from: '/old-path' })
  })

  it('returns an empty array when CMS returns nothing', async () => {
    server.use(http.get(`${CMS_URL}/api/redirects`, () => HttpResponse.json({})))
    const { getRedirects } = await import('@/utilities/getRedirects')
    const redirects = await getRedirects()
    expect(redirects).toEqual([])
  })
})
