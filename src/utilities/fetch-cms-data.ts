import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { locales } from '@/i18n/localization'

const CMS_URL = process.env.CMS_PUBLIC_SERVER_URL

async function fetchJSON(endpoint: string) {
  const res = await fetch(`${CMS_URL}${endpoint}`)
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.status}`)
  return res.json()
}

async function main() {
  console.log('Fetching CMS data for caching...')

  const cacheDir = path.resolve('./.cache')
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  const dataByLocale: Record<string, { pages: any[]; posts: any[]; globals: Record<string, any> }> = {}

  // Fetch with depth=2 (maximum needed) for all locales
  for (const locale of locales) {
    console.log(`  Fetching ${locale}...`)
    const [pagesData, postsData, headerData, footerData] = await Promise.all([
      fetchJSON(`/api/pages?limit=100&depth=2&locale=${locale}`),
      fetchJSON(`/api/posts?limit=100&depth=2&locale=${locale}`),
      fetchJSON(`/api/globals/header?locale=${locale}&depth=1`),
      fetchJSON(`/api/globals/footer?locale=${locale}&depth=1`),
    ])
    const pages = (pagesData.docs || []).sort((a: any, b: any) =>
      (a.slug || '').localeCompare(b.slug || ''),
    )
    const posts = (postsData.docs || []).sort((a: any, b: any) =>
      (a.slug || '').localeCompare(b.slug || ''),
    )
    dataByLocale[locale] = {
      pages,
      posts,
      globals: {
        header: headerData,
        footer: footerData,
      },
    }
  }

  // Save to cache file
  const cacheFile = path.join(cacheDir, 'cms-data.json')
  fs.writeFileSync(cacheFile, JSON.stringify(dataByLocale, null, 2))
  console.log(`✅ CMS data cached to ${cacheFile}`)
  console.log(`   Total: ${Object.keys(dataByLocale).length} locales, ${Object.values(dataByLocale).reduce((sum, d) => sum + d.pages.length + d.posts.length, 0)} documents`)
}

main().catch((err) => {
  console.error('Failed to fetch CMS data:', err.message)
  process.exit(1)
})
