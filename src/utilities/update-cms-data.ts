import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { locales } from '@/i18n/localization'
import crypto from 'crypto'

const CMS_URL = process.env.CMS_PUBLIC_SERVER_URL

async function fetchJSON(endpoint: string) {
  const res = await fetch(`${CMS_URL}${endpoint}`)
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.status}`)
  return res.json()
}

function getContentHash(doc: any): string {
  // Create a hash of the document content (excluding updatedAt, id, and createdAt)
  const content = JSON.stringify(doc, (key, value) => {
    if (key === 'updatedAt' || key === 'id' || key === 'createdAt') return undefined
    return value
  })
  return crypto.createHash('md5').update(content).digest('hex')
}

function compareData(oldData: any, newData: any): { added: string[], modified: string[], removed: string[], details: Map<string, any> } {
  const changes = { added: [] as string[], modified: [] as string[], removed: [] as string[], details: new Map<string, any>() }

  for (const locale of locales) {
    if (!oldData[locale] || !newData[locale]) continue

    const oldPages = new Map<string, any>(oldData[locale].pages.map((p: any) => [p.slug, p]))
    const newPages = new Map<string, any>(newData[locale].pages.map((p: any) => [p.slug, p]))

    // Check for added/modified pages
    for (const [slug, newPage] of newPages) {
      const oldPage = oldPages.get(slug)
      if (!oldPage) {
        changes.added.push(`${locale}/pages/${slug}`)
      } else if (getContentHash(oldPage) !== getContentHash(newPage)) {
        changes.modified.push(`${locale}/pages/${slug}`)
        changes.details.set(`${locale}/pages/${slug}`, { old: oldPage, new: newPage })
      }
    }

    // Check for removed pages
    for (const [slug, oldPage] of oldPages) {
      if (!newPages.has(slug)) {
        changes.removed.push(`${locale}/pages/${slug}`)
      }
    }

    // Same for posts
    const oldPosts = new Map<string, any>(oldData[locale].posts.map((p: any) => [p.slug, p]))
    const newPosts = new Map<string, any>(newData[locale].posts.map((p: any) => [p.slug, p]))

    for (const [slug, newPost] of newPosts) {
      const oldPost = oldPosts.get(slug)
      if (!oldPost) {
        changes.added.push(`${locale}/posts/${slug}`)
      } else if (getContentHash(oldPost) !== getContentHash(newPost)) {
        changes.modified.push(`${locale}/posts/${slug}`)
        changes.details.set(`${locale}/posts/${slug}`, { old: oldPost, new: newPost })
      }
    }

    for (const [slug] of oldPosts) {
      if (!newPosts.has(slug)) {
        changes.removed.push(`${locale}/posts/${slug}`)
      }
    }
  }

  return changes
}

function extractTextFromLayout(layout: any[]): string {
  if (!layout) return ''
  const text: string[] = []

  const traverseRichText = (node: any) => {
    if (node.text && typeof node.text === 'string') text.push(node.text)
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverseRichText(child)
      }
    }
  }

  const traverseLocaleRichText = (richText: any) => {
    if (!richText) return
    // Handle Lexical rich text structure
    if (richText.root?.children) {
      for (const child of richText.root.children) {
        traverseRichText(child)
      }
    }
    // Handle array of rich text nodes
    else if (Array.isArray(richText)) {
      for (const node of richText) {
        traverseRichText(node)
      }
    }
    // Handle string content
    else if (typeof richText === 'string') {
      text.push(richText)
    }
  }

  for (const block of layout) {
    // Handle block-level heading field (richText)
    if (block.heading) {
      // heading is an object with locale keys: { en: {...}, pl: {...} }
      for (const locale of Object.keys(block.heading)) {
        if (locale === 'en' || locale === 'pl') {
          traverseLocaleRichText(block.heading[locale])
        }
      }
    }

    // Handle column richText fields
    if (block.columns && Array.isArray(block.columns)) {
      for (const column of block.columns) {
        if (column.richText) {
          for (const locale of Object.keys(column.richText)) {
            if (locale === 'en' || locale === 'pl') {
              traverseLocaleRichText(column.richText[locale])
            }
          }
        }
      }
    }

    // Handle content blocks
    if (block.blockType === 'content' && block.content) {
      for (const locale of Object.keys(block.content)) {
        if (locale === 'en' || locale === 'pl') {
          traverseLocaleRichText(block.content[locale])
        }
      }
    }

    // Handle other rich text fields at block level
    for (const key of Object.keys(block)) {
      if (key !== 'id' && key !== 'blockType' && key !== 'blockName' && key !== 'heading' && key !== 'columns' && key !== 'content') {
        const value = block[key]
        if (value && typeof value === 'object') {
          for (const locale of Object.keys(value)) {
            if (locale === 'en' || locale === 'pl') {
              traverseLocaleRichText(value[locale])
            }
          }
        }
      }
    }
  }
  return text.join(' ')
}

function showDiff(key: string, oldDoc: any, newDoc: any) {
  console.log(`\n  📄 ${key}`)

  let hasChanges = false

  // Compare simple fields
  const simpleFields = ['title', 'slug', 'publishedAt', 'status']
  for (const field of simpleFields) {
    if (oldDoc[field] !== newDoc[field]) {
      if (!hasChanges) hasChanges = true
      console.log(`  - ${field}:`)
      console.log(`    before: "${oldDoc[field]}"`)
      console.log(`    after:  "${newDoc[field]}"`)
    }
  }

  // Compare meta fields
  if (oldDoc.meta?.title !== newDoc.meta?.title) {
    if (!hasChanges) hasChanges = true
    console.log(`  - meta.title:`)
    console.log(`    before: "${oldDoc.meta?.title}"`)
    console.log(`    after:  "${newDoc.meta?.title}"`)
  }
  if (oldDoc.meta?.description !== newDoc.meta?.description) {
    if (!hasChanges) hasChanges = true
    console.log(`  - meta.description:`)
    console.log(`    before: "${oldDoc.meta?.description}"`)
    console.log(`    after:  "${newDoc.meta?.description}"`)
  }

  // Compare layout (content hash already detected change, just show it changed)
  const oldLayoutStr = JSON.stringify(oldDoc.layout || [])
  const newLayoutStr = JSON.stringify(newDoc.layout || [])
  if (oldLayoutStr !== newLayoutStr) {
    if (!hasChanges) hasChanges = true
    console.log(`  - layout: content changed (${oldLayoutStr.length} chars → ${newLayoutStr.length} chars)`)
  }

  if (!hasChanges) {
    console.log(`  (metadata-only change, e.g., updatedAt)`)
  }
}

async function main() {
  console.log('Fetching CMS data...')

  const newData: Record<string, { pages: any[]; posts: any[]; globals: Record<string, any> }> = {}

  for (const locale of locales) {
    console.log(`  Fetching ${locale}...`)
    const [pagesData, postsData, headerData, footerData] = await Promise.all([
      fetchJSON(`/api/pages?limit=100&depth=1&locale=${locale}`),
      fetchJSON(`/api/posts?limit=100&depth=1&locale=${locale}`),
      fetchJSON(`/api/globals/header?locale=${locale}&depth=1`),
      fetchJSON(`/api/globals/footer?locale=${locale}&depth=1`),
    ])
    const pages = (pagesData.docs || []).sort((a: any, b: any) =>
      (a.slug || '').localeCompare(b.slug || ''),
    )
    const posts = (postsData.docs || []).sort((a: any, b: any) =>
      (a.slug || '').localeCompare(b.slug || ''),
    )
    newData[locale] = {
      pages,
      posts,
      globals: {
        header: headerData,
        footer: footerData,
      },
    }
  }

  const cacheFile = path.resolve('./cms-data.json')
  const oldData = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf-8')) : null

  if (oldData) {
    console.log('\n📊 Comparing with existing data...')
    const changes = compareData(oldData, newData)

    if (changes.added.length === 0 && changes.modified.length === 0 && changes.removed.length === 0) {
      console.log('✅ No changes detected. Nothing to update.')
      return
    }

    console.log('\n📝 Changes detected:')
    if (changes.added.length > 0) {
      console.log(`  Added (${changes.added.length}):`)
      changes.added.forEach(c => console.log(`    + ${c}`))
    }
    if (changes.modified.length > 0) {
      console.log(`  Modified (${changes.modified.length}):`)
      changes.modified.forEach(key => {
        console.log(`    ~ ${key}`)
        const detail = changes.details.get(key)
        if (detail) {
          showDiff(key, detail.old, detail.new)
        }
      })
    }
    if (changes.removed.length > 0) {
      console.log(`  Removed (${changes.removed.length}):`)
      changes.removed.forEach(c => console.log(`    - ${c}`))
    }

    console.log('\n⚠️  This will overwrite cms-data.json')
    console.log('Press Ctrl+C to cancel, or Enter to continue...')
    await new Promise(resolve => {
      process.stdin.once('data', resolve)
    })
    process.stdin.pause()
  } else {
    console.log('⚠️  No existing cms-data.json found. Creating new file.')
  }

  fs.writeFileSync(cacheFile, JSON.stringify(newData))
  console.log(`\n✅ CMS data saved to ${cacheFile}`)
  const fileSize = (fs.statSync(cacheFile).size / 1024 / 1024).toFixed(2)
  console.log(`   File size: ${fileSize} MB`)
  console.log(`   Total: ${Object.keys(newData).length} locales, ${Object.values(newData).reduce((sum, d) => sum + d.pages.length + d.posts.length, 0)} documents`)
}

main().catch((err) => {
  console.error('Failed to update CMS data:', err.message)
  process.exit(1)
})
