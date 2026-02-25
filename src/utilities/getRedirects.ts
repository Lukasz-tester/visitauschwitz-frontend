import { cmsFetchJSON } from './cmsFetch'
import type { Redirect } from '@/payload-types'

export async function getRedirects(): Promise<Redirect[]> {
  const data = await cmsFetchJSON<{ docs?: Redirect[] }>('/api/redirects?limit=0')
  return data?.docs ?? []
}

/**
 * Returns redirects (no caching wrapper needed for static export)
 */
export const getCachedRedirects = () => getRedirects
