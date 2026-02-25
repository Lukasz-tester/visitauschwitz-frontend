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

// Generate static params for export
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.CMS_PUBLIC_SERVER_URL ?? 'https://example.com'}/api/pages?limit=1000`,
    )
    const data = await res.json()

    const params = locales.flatMap((locale) =>
      (data?.docs || [])
        .filter((doc: PageType) => doc.slug !== 'home')
        .map((doc: PageType) => ({
          slug: doc.slug,
          locale,
        })),
    )

    return params
  } catch (err) {
    console.error('Failed to generate static params:', err)
    return []
  }
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
  const fullUrl = `${process.env.CMS_PUBLIC_SERVER_URL ?? 'https://example.com'}/${slug}`

  const page: PageType | null = await fetchPayloadData('pages', slug, locale)

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
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
