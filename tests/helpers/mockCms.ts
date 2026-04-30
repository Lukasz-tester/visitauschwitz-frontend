import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { pageFixture, pagesListResponse } from '../fixtures/page'
import { postFixture, postsListResponse } from '../fixtures/post'
import { headerFixture, footerFixture, redirectsResponse } from '../fixtures/globals'

export const CMS_URL = 'https://cms.test'

/**
 * Default handlers covering the endpoints `cmsFetch` hits.
 * Tests can override with server.use(...).
 */
export function defaultHandlers() {
  return [
    http.get(`${CMS_URL}/api/pages`, ({ request }) => {
      const url = new URL(request.url)
      const slug = url.searchParams.get('where[slug][equals]')
      if (slug && slug !== pageFixture.slug) {
        return HttpResponse.json({ docs: [], totalDocs: 0, page: 1, totalPages: 0 })
      }
      return HttpResponse.json(pagesListResponse)
    }),
    http.get(`${CMS_URL}/api/posts`, ({ request }) => {
      const url = new URL(request.url)
      const slug = url.searchParams.get('where[slug][equals]')
      if (slug && slug !== postFixture.slug) {
        return HttpResponse.json({ docs: [], totalDocs: 0, page: 1, totalPages: 0 })
      }
      return HttpResponse.json(postsListResponse)
    }),
    http.get(`${CMS_URL}/api/globals/header`, () => HttpResponse.json(headerFixture)),
    http.get(`${CMS_URL}/api/globals/footer`, () => HttpResponse.json(footerFixture)),
    http.get(`${CMS_URL}/api/redirects`, () => HttpResponse.json(redirectsResponse)),
  ]
}

export const server = setupServer(...defaultHandlers())
