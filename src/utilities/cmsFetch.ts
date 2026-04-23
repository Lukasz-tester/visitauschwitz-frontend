// Throttled fetch for CMS API to avoid overwhelming the Vercel serverless backend
// during static generation (which fires many concurrent requests)

import fs from 'fs'
import path from 'path'

let pending = 0
const MAX_CONCURRENT = 2
const queue: (() => void)[] = []

function dequeue() {
  while (pending < MAX_CONCURRENT && queue.length > 0) {
    pending++
    const next = queue.shift()!
    next()
  }
}

async function throttledFetch(url: string, init?: RequestInit): Promise<Response> {
  if (pending < MAX_CONCURRENT) {
    pending++
    try {
      const res = await fetch(url, init)
      return res
    } finally {
      pending--
      dequeue()
    }
  }

  return new Promise<Response>((resolve, reject) => {
    queue.push(async () => {
      try {
        const res = await fetch(url, init)
        resolve(res)
      } catch (err) {
        reject(err)
      } finally {
        pending--
        dequeue()
      }
    })
  })
}

function getCachedData() {
  try {
    const cacheFile = path.resolve('./cms-data.json')
    if (fs.existsSync(cacheFile)) {
      const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
      return data
    }
  } catch (err) {
    console.error('Error reading cms-data.json:', err)
  }
  return null
}

export async function cmsFetch(path: string, retries = 3): Promise<Response | null> {
  const url = `${process.env.CMS_PUBLIC_SERVER_URL}${path}`
  for (let i = 0; i < retries; i++) {
    try {
      const res = await throttledFetch(url, { cache: 'no-store' })
      if (res.ok) return res
      console.error(`CMS fetch ${path} attempt ${i + 1} failed: ${res.status}`)
    } catch (err) {
      console.error(`CMS fetch ${path} attempt ${i + 1} error:`, err)
    }
    // Exponential backoff: 1s, 2s, 4s
    if (i < retries - 1) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
  return null
}

import { stripUsedIn } from './stripUsedIn'

export async function cmsFetchJSON<T = unknown>(path: string): Promise<T | null> {
  const cachedData = getCachedData()

  // Skip cache if USE_LOCAL_CMS is set (for local development with fresh data)
  if (process.env.USE_LOCAL_CMS === 'true') {
    console.log(`[USE_LOCAL_CMS] Fetching fresh data from CMS: ${path}`)
    const res = await cmsFetch(path)
    if (!res) return null
    try {
      const data = await res.json()
      stripUsedIn(data)
      return data as T
    } catch {
      return null
    }
  }

  // Try to serve from cache for collection queries
  const collectionMatch = path.match(/\/api\/(pages|posts)\?/)
  if (collectionMatch && cachedData) {
    const collection = collectionMatch[1]
    // Extract locale from query string
    const localeMatch = path.match(/locale=(\w+)/)
    const locale = localeMatch ? localeMatch[1] : null
    // Extract limit from query string
    const limitMatch = path.match(/limit=(\d+)/)
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : null
    // Extract page from query string
    const pageMatch = path.match(/page=(\d+)/)
    const page = pageMatch ? parseInt(pageMatch[1], 10) : 1

    let docs: any[] = []

    if (locale && cachedData[locale]) {
      docs = cachedData[locale][collection] || []
    } else {
      // Fallback: combine all locales if no locale specified
      docs = Object.values(cachedData).flatMap((d: any) => d[collection] || [])
    }

    const totalDocs = docs.length
    const defaultLimit = limit || 12
    const totalPages = Math.ceil(totalDocs / defaultLimit)

    // Apply pagination if page is specified
    if (page > 1 && limit) {
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      docs = docs.slice(startIndex, endIndex)
    }

    // Apply limit if specified (for first page or when no pagination)
    if (limit && limit > 0 && page === 1) {
      docs = docs.slice(0, limit)
    }

    const result = { docs, totalDocs, page, totalPages }
    stripUsedIn(result)
    return result as T
  }

  // Try to serve from cache for globals
  const globalMatch = path.match(/\/api\/globals\/(\w+)\?locale=(\w+)/)
  if (globalMatch && cachedData) {
    const globalSlug = globalMatch[1]
    const locale = globalMatch[2]
    if (cachedData[locale]?.globals?.[globalSlug]) {
      return cachedData[locale].globals[globalSlug] as T
    }
  }

  const res = await cmsFetch(path)
  if (!res) return null
  try {
    const data = await res.json()
    stripUsedIn(data)
    return data as T
  } catch {
    return null
  }
}
