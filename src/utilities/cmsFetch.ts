// Throttled fetch for CMS API to avoid overwhelming the Vercel serverless backend
// during static generation (which fires many concurrent requests)

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

export async function cmsFetchJSON<T = unknown>(path: string): Promise<T | null> {
  const res = await cmsFetch(path)
  if (!res) return null
  try {
    return await res.json() as T
  } catch {
    return null
  }
}
