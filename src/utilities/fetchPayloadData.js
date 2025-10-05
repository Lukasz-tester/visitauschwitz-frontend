// utils/fetchPayloadData.js
export async function fetchPayloadData(collection, slug, locale) {
  const base = process.env.CMS_PUBLIC_SERVER_URL // e.g. https://cms.visitauschwitz.info
  const url = `${base}/api/${collection}?where[slug][equals]=${slug}&locale=${locale}`

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch ${collection}`)
  const data = await res.json()

  return data?.docs?.[0] || null
}
