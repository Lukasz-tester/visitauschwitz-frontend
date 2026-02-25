// utils/fetchPayloadData.js
// Note: cannot import cmsFetch.ts from JS, so inline the throttled fetch logic

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

export async function fetchPayloadData(collection, slug, locale) {
  const base = process.env.CMS_PUBLIC_SERVER_URL
  const url = `${base}/api/${collection}?where[slug][equals]=${slug}&locale=${locale}`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await throttledFetch(url, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        return data?.docs?.[0] || null
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
