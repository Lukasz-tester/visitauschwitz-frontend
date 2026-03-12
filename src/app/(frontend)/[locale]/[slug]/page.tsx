// app/[locale]/[slug]/page.tsx
export const revalidate = false
export const dynamic = 'force-static'

import React from 'react'
import type { Metadata } from 'next'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import PageClient from './page.client'
import { generateMeta } from '@/utilities/generateMeta'
import { fetchPayloadData } from '@/utilities/fetchPayloadData'
import type { Page as PageType } from '@/payload-types'
import type { TypedLocale } from '@/payload-types'
import { locales } from '@/i18n/localization'
import { buildPageGraph, type SchemaNavItem } from '@/utilities/buildSchema'
import { getHeroImageUrl } from '@/utilities/getHeroImageUrl'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header } from '@/payload-types'
import { TableOfContents, type TocItem } from '@/components/TableOfContents'

function extractText(node: any): string {
  if (node.text) return node.text
  if (node.children) return node.children.map(extractText).join('')
  return ''
}

function extractTocItems(blocks: PageType['layout'][0][]): TocItem[] {
  if (!blocks) return []
  return blocks
    .filter((block) => block.blockName)
    .map((block) => {
      let label = block.blockName!.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      if (block.blockType === 'content' && 'heading' in block && block.heading?.root?.children) {
        // Extract only the first heading node text (skip description paragraphs)
        const firstChild = block.heading.root.children[0]
        if (firstChild) {
          const text = extractText(firstChild).trim()
          if (text) label = text.length > 50 ? text.slice(0, 47) + '...' : text
        }
      }
      return { id: block.blockName!, label }
    })
}

const MIN_TOC_ITEMS = 3

// Generate static params for export
export async function generateStaticParams() {
  const { cmsFetchJSON } = await import('@/utilities/cmsFetch')
  const data = await cmsFetchJSON<{ docs?: PageType[] }>('/api/pages?limit=1000')
  if (!data) return []

  return locales.flatMap((locale) =>
    (data.docs || [])
      .filter((doc) => doc.slug !== 'home')
      .map((doc) => ({
        slug: doc.slug,
        locale,
      })),
  )
}

type Args = {
  params: Promise<{
    slug?: string
    locale: TypedLocale
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug = 'home', locale = 'en' } = await paramsPromise
  const url = '/' + slug
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.visitauschwitz.info'
  const fullUrl = `${siteUrl}/${locale}/${slug}`

  const page: PageType | null = await fetchPayloadData('pages', slug, locale)

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page
  const tocItems = extractTocItems(layout)
  const heroImageUrl = getHeroImageUrl(page)

  const header = await getCachedGlobal<Header>('header', 1, locale)()
  const navItems = (header?.navItems ?? []) as SchemaNavItem[]

  const homeLabel = locale === 'pl' ? 'Strona główna' : 'Home'
  const pageLabel = page.meta?.title || page.title
  const schema = buildPageGraph({
    page,
    locale,
    url: fullUrl,
    breadcrumbItems: [
      { name: homeLabel, url: `${siteUrl}/` },
      { name: pageLabel, url: fullUrl },
    ],
    navItems,
  })

  return (
    <article className="pt-16 pb-24">
      {heroImageUrl && (
        <link rel="preload" as="image" href={heroImageUrl} />
      )}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      <RenderHero {...hero} />
      {tocItems.length >= MIN_TOC_ITEMS && <TableOfContents items={tocItems} />}
      <RenderBlocks blocks={layout} locale={locale} url={fullUrl} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home', locale = 'en' } = await params
  const page = await fetchPayloadData('pages', slug, locale)
  return generateMeta({ doc: page, locale })
}
