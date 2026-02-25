import type { TypedLocale } from '@/payload-types'
import { cmsFetchJSON } from './cmsFetch'

async function getGlobal<T = unknown>(slug: string, depth = 0, locale: TypedLocale): Promise<T | null> {
  return cmsFetchJSON<T>(`/api/globals/${slug}?locale=${locale}&depth=${depth}`)
}

// In-memory cache: only caches successful results during the build
const buildCache = new Map<string, unknown>()

export const getCachedGlobal = <T = unknown>(slug: string, depth = 0, locale: TypedLocale) => {
  return async (): Promise<T> => {
    const key = `${slug}_${locale}_${depth}`
    if (buildCache.has(key)) return buildCache.get(key) as T
    const data = await getGlobal<T>(slug, depth, locale)
    if (data !== null) {
      buildCache.set(key, data)
    }
    return data as T
  }
}
