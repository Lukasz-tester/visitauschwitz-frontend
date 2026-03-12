import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { locales } from '@/i18n/localization'
import { formatMetaTitle } from '@/utilities/formatMetaTitle'

const CMS_URL = process.env.CMS_PUBLIC_SERVER_URL

async function fetchJSON(endpoint: string) {
  const res = await fetch(`${CMS_URL}${endpoint}`)
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.status}`)
  return res.json()
}

const EXCLUDED_SLUGS = ['contact', 'privacy', 'terms']

function pagePath(slug: string): string {
  if (!slug || slug === 'home') return '/'
  return `/${slug}`
}

async function main() {
  console.log('Generating meta.txt from CMS at:', CMS_URL)

  const lines: string[] = []

  // --- PAGES per locale ---
  for (const locale of locales) {
    const pagesData = await fetchJSON(`/api/pages?limit=100&depth=0&locale=${locale}`)
    const pages = (pagesData.docs || []) as any[]

    const entries: { path: string; title: string; description: string }[] = []

    for (const page of pages) {
      if (EXCLUDED_SLUGS.includes(page.slug)) continue
      entries.push({
        path: pagePath(page.slug),
        title: formatMetaTitle(page.meta?.title || page.title || page.slug),
        description: page.meta?.description || '',
      })
    }

    entries.sort((a, b) => a.path.localeCompare(b.path))

    lines.push(locale.toUpperCase())
    lines.push('')

    for (const entry of entries) {
      lines.push(`Path: ${entry.path}`)
      lines.push(`T: ${entry.title}`)
      lines.push(`D: ${entry.description}`)
      lines.push('')
    }
  }

  // --- POSTS per locale ---
  lines.push('POSTS')
  lines.push('')

  for (const locale of locales) {
    const postsData = await fetchJSON(`/api/posts?limit=100&depth=0&locale=${locale}`)
    const posts = (postsData.docs || []) as any[]

    if (posts.length === 0) continue

    lines.push(locale.toUpperCase())
    lines.push('')

    const sorted = posts.sort((a: any, b: any) =>
      (a.slug || '').localeCompare(b.slug || ''),
    )

    for (const post of sorted) {
      lines.push(`Path: /posts/${post.slug}`)
      lines.push(`T: ${formatMetaTitle(post.meta?.title || post.title || post.slug)}`)
      lines.push(`D: ${post.meta?.description || ''}`)
      lines.push('')
    }
  }

  const publicDir = path.resolve('./public')
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir)

  fs.writeFileSync(path.join(publicDir, 'meta.txt'), lines.join('\n'))
  console.log('  meta.txt saved')
}

main().catch((err) => {
  console.error('Failed to generate meta.txt:', err.message)
  console.log('Keeping existing file if present')
})
