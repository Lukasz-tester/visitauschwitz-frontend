import { unstable_cache } from 'next/cache'

async function getDocument(collection: string, slug: string, locale?: string) {
  const localeParam = locale ? `&locale=${locale}` : ''
  const res = await fetch(
    `${process.env.CMS_PUBLIC_SERVER_URL}/api/${collection}?where[slug][equals]=${slug}${localeParam}&depth=2`,
    { next: { revalidate: false } },
  )
  const data = await res.json()
  return data?.docs?.[0] ?? null
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedDocument = (collection: string, slug: string, locale?: string) =>
  unstable_cache(async () => getDocument(collection, slug, locale), [collection, slug], {
    tags: [`${collection}_${slug}`],
  })
