import { unstable_cache } from 'next/cache'
import type { TypedLocale } from '@/payload-types'

async function getGlobal(slug: string, depth = 0, locale: TypedLocale) {
  try {
    const res = await fetch(
      `${process.env.CMS_PUBLIC_SERVER_URL}/api/globals/${slug}?locale=${locale}&depth=${depth}`,
      { next: { revalidate: false } },
    )
    if (!res.ok) {
      console.error(`Failed to fetch global ${slug}: ${res.status}`)
      return null
    }
    return res.json()
  } catch (err) {
    console.error(`Error fetching global ${slug}:`, err)
    return null
  }
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug and locale
 */
export const getCachedGlobal = (slug: string, depth = 0, locale: TypedLocale) =>
  unstable_cache(async () => getGlobal(slug, depth, locale), [slug, locale], {
    tags: [`global_${slug}`],
  })
