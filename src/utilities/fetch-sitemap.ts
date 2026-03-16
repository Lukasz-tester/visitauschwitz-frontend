import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const CMS_URL = process.env.CMS_PUBLIC_SERVER_URL
const SITE_URL = 'https://www.visitauschwitz.info'
const LOCALES = ['en', 'pl']
const STATIC_PAGES = ['privacy', 'terms']

console.log('Fetching sitemap from CMS at:', `${CMS_URL}/sitemap.xml`)

function getSlug(loc: string): string {
  // Extract the path segment after the locale, e.g. "/en/tickets" → "tickets", "/en/" → ""
  const match = loc.match(/\/(?:en|pl)\/(.*)$/)
  return match ? match[1].replace(/\/$/, '') : ''
}

function getPriority(slug: string): string {
  if (slug === '') return '1.0'
  if (['tickets', 'arrival', 'museum', 'tour'].includes(slug)) return '0.8'
  if (['supplement', 'contact'].includes(slug)) return '0.6'
  if (['privacy', 'terms'].includes(slug)) return '0.3'
  return '0.5'
}

function getChangefreq(slug: string): string {
  if (['privacy', 'terms'].includes(slug)) return 'yearly'
  if (['tickets', 'museum'].includes(slug)) return 'weekly'
  return 'monthly'
}

function buildStaticPageEntries(): string {
  const today = new Date().toISOString().slice(0, 10)
  return STATIC_PAGES.flatMap((slug) =>
    LOCALES.map(
      (locale) =>
        `  <url>\n    <loc>${SITE_URL}/${locale}/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${getChangefreq(slug)}</changefreq>\n    <priority>${getPriority(slug)}</priority>\n  </url>`,
    ),
  ).join('\n')
}

function adjustSitemap(xml: string): string {
  const today = new Date().toISOString().slice(0, 10)
  let adjusted = xml.replace(/<url>([\s\S]*?)<\/url>/g, (urlBlock) => {
    const locMatch = urlBlock.match(/<loc>([^<]+)<\/loc>/)
    if (!locMatch) return urlBlock

    const slug = getSlug(locMatch[1])
    const priority = getPriority(slug)
    const changefreq = getChangefreq(slug)

    return urlBlock
      .replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${today}</lastmod>`)
      .replace(/<priority>[^<]+<\/priority>/, `<priority>${priority}</priority>`)
      .replace(/<changefreq>[^<]+<\/changefreq>/, `<changefreq>${changefreq}</changefreq>`)
  })

  // Append static frontend-only pages
  const staticEntries = buildStaticPageEntries()
  adjusted = adjusted.replace('</urlset>', `${staticEntries}\n</urlset>`)

  return adjusted
}

async function main() {
  try {
    const res = await fetch(`${CMS_URL}/sitemap.xml`)
    if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status}`)
    const sitemap = adjustSitemap(await res.text())

    const publicDir = path.resolve('./public')
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir)

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap)
    console.log('✅ Sitemap saved to public/sitemap.xml')
  } catch (err) {
    console.error(err)
    const existing = path.resolve('./public/sitemap.xml')
    if (fs.existsSync(existing)) {
      console.log('⚠️  Using existing sitemap.xml')
    } else {
      console.log('⚠️  No existing sitemap.xml found, skipping')
    }
  }
}

main()
