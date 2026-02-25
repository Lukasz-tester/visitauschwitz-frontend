import { unstable_cache } from 'next/cache'

export async function getRedirects() {
  const res = await fetch(
    `${process.env.CMS_PUBLIC_SERVER_URL}/api/redirects?limit=0`,
    { next: { revalidate: false } },
  )
  const data = await res.json()
  return data?.docs ?? []
}

/**
 * Returns a unstable_cache function mapped with the cache tag for 'redirects'.
 *
 * Cache all redirects together to avoid multiple fetches.
 */
export const getCachedRedirects = () =>
  unstable_cache(async () => getRedirects(), ['redirects'], {
    tags: ['redirects'],
  })
