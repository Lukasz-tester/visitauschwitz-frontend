import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { locales } from '@/i18n/localization'

const CMS_URL = process.env.CMS_PUBLIC_SERVER_URL
// Always use the production URL for llms.txt (it's a public-facing file)
const SITE_URL = 'https://www.visitauschwitz.info'

async function fetchJSON(endpoint: string) {
  const res = await fetch(`${CMS_URL}${endpoint}`)
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.status}`)
  return res.json()
}

function extractText(richText: any, maxLength = 500): string {
  if (!richText?.root?.children) return ''
  const traverse = (nodes) =>
    nodes
      .map((n) => {
        if (n.text) return n.text
        if (n.children) return traverse(n.children)
        return ''
      })
      .join(' ')
  const full = traverse(richText.root.children).replace(/\s+/g, ' ').trim()
  return maxLength ? full.slice(0, maxLength) : full
}

function extractFAQs(blocks: any[]) {
  if (!blocks) return []
  return blocks
    .filter((b) => b.blockType === 'accordion' && b.isFAQ)
    .flatMap(
      (b) =>
        (b.accordionItems || []).map((item) => ({
          question: item.question || '',
          answer: extractText(item.answer, 300),
        })),
    )
}

function pageUrl(locale: string, slug: string) {
  if (!slug || slug === 'home') return `${SITE_URL}/${locale}`
  return `${SITE_URL}/${locale}/${slug}`
}

async function main() {
  console.log('Generating llms.txt from CMS at:', CMS_URL)

  const [pagesData, postsData] = await Promise.all([
    fetchJSON('/api/pages?limit=100&depth=1&locale=en'),
    fetchJSON('/api/posts?limit=100&depth=1&locale=en'),
  ])

  const pages = pagesData.docs || []
  const posts = postsData.docs || []

  // --- llms.txt (concise) ---
  const lines: string[] = []
  lines.push('# Visit Auschwitz')
  lines.push('')
  lines.push('> Practical visitor guide for the Auschwitz-Birkenau Memorial and Museum,')
  lines.push('> created by a licensed Auschwitz guide with experience since 2006.')
  lines.push('> Covers tickets, transportation, tour routes, regulations, and preparation tips.')
  lines.push('')
  lines.push(`Website: ${SITE_URL}`)
  lines.push(`Languages: ${locales.join(', ')}`)
  lines.push('')

  lines.push('## Pages')
  lines.push('')
  for (const page of pages) {
    const title = page.meta?.title || page.title || page.slug
    const desc = page.meta?.description || ''
    const slug = page.slug
    lines.push(`- [${title}](${pageUrl('en', slug)})${desc ? ': ' + desc : ''}`)
  }
  lines.push('')

  if (posts.length > 0) {
    lines.push('## Posts')
    lines.push('')
    for (const post of posts) {
      const title = post.meta?.title || post.title || post.slug
      const desc = post.meta?.description || ''
      lines.push(`- [${title}](${SITE_URL}/en/posts/${post.slug})${desc ? ': ' + desc : ''}`)
    }
    lines.push('')
  }

  lines.push('## Key Facts')
  lines.push('')
  lines.push('- Location: Oświęcim, Poland (70 km / 43 mi from Kraków, ~1 hour by train)')
  lines.push('- Address: Więźniów Oświęcimia 55, 32-600 Oświęcim, Poland')
  lines.push('- Official museum site: https://www.auschwitz.org/')
  lines.push('- Official booking: https://visit.auschwitz.org/')
  lines.push('- The memorial consists of two sites: Auschwitz I (Main Camp) and Auschwitz II-Birkenau')
  lines.push('- UNESCO World Heritage Site since 1979')
  lines.push('')
  lines.push(`## Detailed version`)
  lines.push('')
  lines.push(`For more detail see [llms-full.txt](${SITE_URL}/llms-full.txt)`)

  // --- llms-full.txt (detailed with FAQ content) ---
  const full: string[] = []
  full.push('# Visit Auschwitz - Full Content Reference')
  full.push('')
  full.push('> Comprehensive visitor guide for the Auschwitz-Birkenau Memorial and Museum.')
  full.push('> Author: Łukasz, licensed Auschwitz guide since 2006.')
  full.push('')
  full.push(`Website: ${SITE_URL}`)
  full.push(`Languages: ${locales.join(', ')}`)
  full.push('')

  for (const page of pages) {
    const title = page.meta?.title || page.title || page.slug
    const desc = page.meta?.description || ''
    const slug = page.slug
    full.push(`## ${title}`)
    full.push('')
    full.push(`URL: ${pageUrl('en', slug)}`)
    if (desc) full.push(`Description: ${desc}`)
    full.push('')

    // Extract FAQ items from this page
    const faqs = extractFAQs(page.layout)
    if (faqs.length > 0) {
      full.push('### FAQ')
      full.push('')
      for (const faq of faqs) {
        full.push(`**Q: ${faq.question}**`)
        full.push(`A: ${faq.answer}`)
        full.push('')
      }
    }

    // Extract headings from content blocks for structure
    const headings: string[] = []
    for (const block of page.layout || []) {
      if (block.blockType === 'content' && block.heading?.root?.children) {
        const heading = extractText(block.heading, 200)
        if (heading) headings.push(heading)
      }
    }
    if (headings.length > 0) {
      full.push('### Sections')
      full.push('')
      for (const h of headings) {
        full.push(`- ${h}`)
      }
      full.push('')
    }
  }

  if (posts.length > 0) {
    full.push('---')
    full.push('')
    full.push('## Blog Posts')
    full.push('')
    for (const post of posts) {
      const title = post.meta?.title || post.title || post.slug
      const desc = post.meta?.description || ''
      full.push(`### ${title}`)
      full.push('')
      full.push(`URL: ${SITE_URL}/en/posts/${post.slug}`)
      if (desc) full.push(`Description: ${desc}`)
      if (post.publishedAt) full.push(`Published: ${post.publishedAt.slice(0, 10)}`)
      full.push('')
    }
  }

  full.push('---')
  full.push('')
  full.push('## Key Facts')
  full.push('')
  full.push('- Location: Oświęcim, Poland (70 km from Kraków)')
  full.push('- Address: Więźniów Oświęcimia 55, 32-600 Oświęcim')
  full.push('- Official museum: https://www.auschwitz.org/')
  full.push('- Official booking: https://visit.auschwitz.org/')
  full.push('- Two sites: Auschwitz I (Main Camp) and Auschwitz II-Birkenau (3 km apart)')
  full.push('- UNESCO World Heritage Site since 1979')
  full.push('- ~2 million visitors per year')

  // Write files
  const publicDir = path.resolve('./public')
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir)

  fs.writeFileSync(path.join(publicDir, 'llms.txt'), lines.join('\n'))
  console.log('  llms.txt saved')

  fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), full.join('\n'))
  console.log('  llms-full.txt saved')
}

main().catch((err) => {
  console.error('Failed to generate llms.txt:', err.message)
  console.log('Keeping existing files if present')
})
