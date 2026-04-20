// utils/fetchPayloadData.js
// Note: cannot import cmsFetch.ts from JS, so inline the throttled fetch logic

import fs from 'fs'
import path from 'path'

let pending = 0
const MAX_CONCURRENT = 2
const queue = []

function dequeue() {
  while (pending < MAX_CONCURRENT && queue.length > 0) {
    pending++
    const next = queue.shift()
    next()
  }
}

async function throttledFetch(url, init) {
  if (pending < MAX_CONCURRENT) {
    pending++
    try {
      return await fetch(url, init)
    } finally {
      pending--
      dequeue()
    }
  }

  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        resolve(await fetch(url, init))
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
    const cacheFile = path.resolve('./.cache/cms-data.json')
    if (fs.existsSync(cacheFile)) {
      const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
      return data
    }
  } catch (err) {
    console.error('Error reading cache:', err)
  }
  return null
}

import { stripUsedIn } from './stripUsedIn'

export async function fetchPayloadData(collection, slug, locale) {
  // Try cache first
  const cachedData = getCachedData()
  if (cachedData && cachedData[locale]) {
    const items = cachedData[locale][collection] || []
    const doc = items.find((item) => item.slug === slug) || null
    if (doc) {
      stripUsedIn(doc)
      return doc
    }
  }

  // Fallback to fetching from CMS
  const base = process.env.CMS_PUBLIC_SERVER_URL
  const url = `${base}/api/${collection}?where[slug][equals]=${slug}&locale=${locale}&depth=2`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await throttledFetch(url, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const doc = data?.docs?.[0] || null
        if (doc) stripUsedIn(doc)
        return doc
      }
      console.error(`Failed to fetch ${collection}/${slug}: ${res.status} ${res.statusText}`)
    } catch (err) {
      console.error(`Error fetching ${collection}/${slug} (attempt ${attempt + 1}):`, err)
    }
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)))
    }
  }
  return null
}
