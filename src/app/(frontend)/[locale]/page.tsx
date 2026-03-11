export const revalidate = false
export const dynamic = 'force-static'

import React from 'react'
import { Metadata } from 'next'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import PageClient from './[slug]/page.client'
import { generateMeta } from '@/utilities/generateMeta'
import type { Page as PageType } from '@/payload-types'
import type { TypedLocale } from '@/payload-types'
import { fetchPayloadData } from '@/utilities/fetchPayloadData'
import { buildPageGraph, type SchemaNavItem } from '@/utilities/buildSchema'
import { getHeroImageUrl } from '@/utilities/getHeroImageUrl'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header } from '@/payload-types'
import { HomepageNewsletter } from '@/components/NewsletterSignup/HomepageNewsletter'

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
  const fullUrl = `${siteUrl}/${locale}`

  const page: PageType | null = await fetchPayloadData('pages', slug, locale)

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page
  const heroImageUrl = getHeroImageUrl(page)

  const header = await getCachedGlobal<Header>('header', 1, locale)()
  const navItems = (header?.navItems ?? []) as SchemaNavItem[]

  const schema = buildPageGraph({
    page,
    locale,
    url: fullUrl,
    breadcrumbItems: [{ name: locale === 'pl' ? 'Strona główna' : 'Home', url: `${siteUrl}/` }],
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
      <RenderBlocks blocks={layout} locale={locale} url={fullUrl} insertBeforeLast={<HomepageNewsletter />} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale = 'en', slug = 'home' } = await params
  const page = await fetchPayloadData('pages', slug, locale)
  return generateMeta({ doc: page, locale })
}
