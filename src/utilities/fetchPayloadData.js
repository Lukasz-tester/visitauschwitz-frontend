// utils/fetchPayloadData.js
export async function fetchPayloadData(collection, slug, locale) {
  const base = process.env.CMS_PUBLIC_SERVER_URL // e.g. https://cms.visitauschwitz.info
  const url = `${base}/api/${collection}?where[slug][equals]=${slug}&locale=${locale}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      console.error(`Failed to fetch ${collection}/${slug}: ${res.status} ${res.statusText}`)
      return null
    }
    const data = await res.json()
    return data?.docs?.[0] || null
  } catch (err) {
    console.error(`Error fetching ${collection}/${slug}:`, err)
    return null
  }
}
