import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const CMS_URL = process.env.CMS_PUBLIC_SERVER_URL
const SITE_URL = 'https://www.visitauschwitz.info'
const LOCALES = ['en', 'pl']
const STATIC_PAGES = ['privacy', 'terms']
const STATIC_LASTMOD = '2026-01-01'
const TODAY = new Date().toISOString().slice(0, 10)
// const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

// Slugs that use deploy date instead of updatedAt
const DEPLOY_DATE_SLUGS = ['home', 'faq']

interface Doc {
  slug?: string
  updatedAt: string
}

async function getCachedData() {
  const cacheFile = path.resolve('./.cache/cms-data.json')
  if (fs.existsSync(cacheFile)) {
    console.log('Reading from cache...')
    const data = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
    return data
  }
  console.log('Cache not found, fetching from CMS...')
  return null
}

function getPriority(slug: string): string {
  if (slug === '') return '1.0'
  if (['tickets', 'arrival', 'museum', 'tour', 'faq'].includes(slug)) return '0.8'
  if (['supplement', 'contact'].includes(slug)) return '0.6'
  if (['privacy', 'terms'].includes(slug)) return '0.3'
  return '0.5'
}

function getChangefreq(slug: string): string {
  if (['privacy', 'terms'].includes(slug)) return 'yearly'
  if (['tickets', 'museum'].includes(slug)) return 'weekly'
  return 'monthly'
}

function getLastmod(doc: Doc): string {
  if (doc.slug && DEPLOY_DATE_SLUGS.includes(doc.slug)) return TODAY
  return doc.updatedAt.slice(0, 10)
}

function buildUrlEntry(slug: string, pathPrefix: string, lastmod: string): string {
  const displaySlug = slug === '' ? '' : `/${slug}`
  const urlPath = pathPrefix ? `/${pathPrefix}${displaySlug}` : displaySlug

  const alternates = [
    ...LOCALES.map(
      (l) => `  <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}${urlPath}/" />`,
    ),
    `  <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en${urlPath}/" />`,
  ].join('\n')

  return LOCALES.map(
    (locale) =>
      `<url>\n` +
      `  <loc>${SITE_URL}/${locale}${urlPath}/</loc>\n` +
      `${alternates}\n` +
      `  <lastmod>${lastmod}</lastmod>\n` +
      `  <changefreq>${getChangefreq(slug)}</changefreq>\n` +
      `  <priority>${getPriority(slug)}</priority>\n` +
      `</url>`,
  ).join('\n')
}

async function fetchDocs(collection: string): Promise<Doc[]> {
  const url = `${CMS_URL}/api/${collection}?limit=1000&where[_status][equals]=published`
  console.log(`Fetching ${collection} from: ${url}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${collection}: ${res.status}`)
  const data = (await res.json()) as { docs?: Doc[] }
  return data.docs ?? []
}

async function main() {
  try {
    // Try to use cached data first
    const cachedData = await getCachedData()

    let pages: Doc[], posts: Doc[]

    if (cachedData) {
      // Extract pages and posts from cache (combine all locales, deduplicate by slug)
      const allPages = Object.values(cachedData).flatMap((d: any) => d.pages)
      const allPosts = Object.values(cachedData).flatMap((d: any) => d.posts)
      // Deduplicate by slug
      const pageMap = new Map(allPages.map((p: any) => [p.slug, p]))
      const postMap = new Map(allPosts.map((p: any) => [p.slug, p]))
      pages = Array.from(pageMap.values())
      posts = Array.from(postMap.values())
      console.log(`Found ${pages.length} pages, ${posts.length} posts from cache`)
    } else {
      // Fallback to fetching from CMS
      const [fetchedPages, fetchedPosts] = await Promise.all([fetchDocs('pages'), fetchDocs('posts')])
      pages = fetchedPages
      posts = fetchedPosts
      console.log(`Found ${pages.length} pages, ${posts.length} posts from CMS`)
    }

    const entries: string[] = []

    for (const page of pages) {
      if (!page.slug) continue
      const slug = page.slug === 'home' ? '' : page.slug
      entries.push(buildUrlEntry(slug, '', getLastmod(page)))
    }

    for (const post of posts) {
      if (!post.slug) continue
      entries.push(buildUrlEntry(post.slug, 'posts', getLastmod(post)))
    }

    for (const slug of STATIC_PAGES) {
      entries.push(buildUrlEntry(slug, '', STATIC_LASTMOD))
    }

    const sitemap =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      entries.join('\n') +
      `\n</urlset>\n`

    const publicDir = path.resolve('./public')
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir)

    fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemap)
    console.log('✅ Sitemap saved to public/sitemap-index.xml')
  } catch (err) {
    console.error(err)
    const existing = path.resolve('./public/sitemap-index.xml')
    if (fs.existsSync(existing)) {
      console.log('⚠️  Using existing sitemap-index.xml')
    } else {
      console.log('⚠️  No existing sitemap-index.xml found, skipping')
    }
  }
}

main()
