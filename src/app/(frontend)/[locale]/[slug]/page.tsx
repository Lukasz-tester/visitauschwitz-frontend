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
import { fetchPayloadData, conditionalCache } from '@/utilities/fetchPayloadData'

const getCachedPayload = conditionalCache(fetchPayloadData)
import type { Page as PageType } from '@/payload-types'
import type { TypedLocale } from '@/payload-types'
import { locales } from '@/i18n/localization'
import { buildPageGraph, type SchemaNavItem } from '@/utilities/buildSchema'
import { getHeroImageUrl } from '@/utilities/getHeroImageUrl'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header } from '@/payload-types'
import { TableOfContents } from '@/components/TableOfContents'
import { extractTocItems } from '@/utilities/extractTocItems'
import { ShareButtons } from '@/components/ShareButtons'

const MIN_TOC_ITEMS = 3

// Generate static params for export
export async function generateStaticParams() {
  const { cmsFetchJSON } = await import('@/utilities/cmsFetch')
  const data = await cmsFetchJSON<{ docs?: PageType[] }>('/api/pages?limit=1000')
  if (!data) return []

  return locales.flatMap((locale) =>
    (data.docs || [])
      .filter((doc) => doc.slug !== 'home' && doc.slug !== 'newsletter')
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

  const page: PageType | null = await getCachedPayload('pages', slug, locale)

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page
  const tocItems = extractTocItems(layout, hero)
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article className="pt-16 pb-7">
        {heroImageUrl && <link rel="preload" as="image" href={heroImageUrl} />}
        <PageClient />
        <PayloadRedirects disableNotFound url={url} />
        <RenderHero {...hero} />
        {tocItems.length >= MIN_TOC_ITEMS && <TableOfContents items={tocItems} />}
        <RenderBlocks blocks={layout} locale={locale} url={fullUrl} />
        <ShareButtons
          className="container pt-6 mt-24 border-t border-border text-sm"
          url={fullUrl}
          title={(page as PageType).meta?.title || (page as PageType).title}
        />
      </article>
    </>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home', locale = 'en' } = await params
  const page = await getCachedPayload('pages', slug, locale)
  return generateMeta({ doc: page, locale })
}
