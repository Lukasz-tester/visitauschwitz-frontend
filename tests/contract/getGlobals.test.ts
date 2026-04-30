import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server, CMS_URL } from '../helpers/mockCms'
import { headerFixture, footerFixture } from '../fixtures/globals'

beforeAll(() => {
  process.env.CMS_PUBLIC_SERVER_URL = CMS_URL
  process.env.USE_LOCAL_CMS = 'true'
  server.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getCachedGlobal', () => {
  it('fetches a header global', async () => {
    const { getCachedGlobal } = await import('@/utilities/getGlobals')
    const data = (await getCachedGlobal<any>('header', 1, 'en' as any)()) as any
    expect(data?.navItems).toEqual(headerFixture.navItems)
  })

  it('fetches a footer global', async () => {
    const { getCachedGlobal } = await import('@/utilities/getGlobals')
    const data = (await getCachedGlobal<any>('footer', 1, 'pl' as any)()) as any
    expect(data?.navItems).toEqual(footerFixture.navItems)
  })

  it('returns null for an unknown global', async () => {
    server.use(
      http.get(`${CMS_URL}/api/globals/unknown`, () => HttpResponse.json({}, { status: 404 })),
    )
    const { getCachedGlobal } = await import('@/utilities/getGlobals')
    const data = await getCachedGlobal<any>('unknown', 0, 'en' as any)()
    expect(data).toBeNull()
  })
})
