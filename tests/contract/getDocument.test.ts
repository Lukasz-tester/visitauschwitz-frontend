import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server, CMS_URL } from '../helpers/mockCms'
import { pageFixture } from '../fixtures/page'

beforeAll(() => {
  process.env.CMS_PUBLIC_SERVER_URL = CMS_URL
  process.env.USE_LOCAL_CMS = 'true' // bypass cms-data.json cache path
  server.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('getDocument', () => {
  it('returns the first matching document', async () => {
    const { getDocument } = await import('@/utilities/getDocument')
    const doc = (await getDocument('pages', 'about', 'en')) as any
    expect(doc?.slug).toBe(pageFixture.slug)
  })

  it('returns null when no document matches', async () => {
    const { getDocument } = await import('@/utilities/getDocument')
    const doc = await getDocument('pages', 'does-not-exist', 'en')
    expect(doc).toBeNull()
  })

  it('passes locale to the CMS query', async () => {
    let captured: string | null = null
    server.use(
      http.get(`${CMS_URL}/api/pages`, ({ request }) => {
        captured = new URL(request.url).searchParams.get('locale')
        return HttpResponse.json({ docs: [pageFixture], totalDocs: 1, page: 1, totalPages: 1 })
      }),
    )
    const { getDocument } = await import('@/utilities/getDocument')
    await getDocument('pages', 'about', 'pl')
    expect(captured).toBe('pl')
  })
})
