import { cmsFetchJSON } from './cmsFetch'

async function getDocument(collection: string, slug: string, locale?: string) {
  const localeParam = locale ? `&locale=${locale}` : ''
  const data = await cmsFetchJSON<{ docs?: unknown[] }>(
    `/api/${collection}?where[slug][equals]=${slug}${localeParam}&depth=2`,
  )
  return data?.docs?.[0] ?? null
}

/**
 * Returns the getDocument function (no caching needed for static export)
 */
export const getCachedDocument = (collection: string, slug: string, locale?: string) =>
  async () => getDocument(collection, slug, locale)

export { getDocument }
