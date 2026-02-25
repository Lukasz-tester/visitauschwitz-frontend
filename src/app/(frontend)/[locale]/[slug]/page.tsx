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
import { buildPageGraph } from '@/utilities/buildSchema'

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
  })

  return (
    <article className="pt-16 pb-24">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} locale={locale} url={fullUrl} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home', locale = 'en' } = await params
  const page = await fetchPayloadData('pages', slug, locale)
  return generateMeta({ doc: page, locale })
}
