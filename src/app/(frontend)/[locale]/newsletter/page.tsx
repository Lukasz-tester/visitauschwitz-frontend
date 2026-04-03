export const revalidate = false
export const dynamic = 'force-static'

import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import PageClient from '../[slug]/page.client'
import { generateMeta } from '@/utilities/generateMeta'
import type { Page as PageType } from '@/payload-types'
import type { TypedLocale } from '@/payload-types'
import { fetchPayloadData } from '@/utilities/fetchPayloadData'
import { buildPageGraph, type SchemaNavItem } from '@/utilities/buildSchema'
import { getHeroImageUrl } from '@/utilities/getHeroImageUrl'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header } from '@/payload-types'
import { locales } from '@/i18n/localization'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { ConfirmationBanner } from './ConfirmationBanner'

const SLUG = 'newsletter'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

type Args = {
  params: Promise<{ locale: TypedLocale }>
}

export default async function NewsletterPage({ params }: Args) {
  const { locale = 'en' } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.visitauschwitz.info'
  const fullUrl = `${siteUrl}/${locale}/${SLUG}`

  const page: PageType | null = await fetchPayloadData('pages', SLUG, locale)

  if (!page) {
    return <PayloadRedirects url={`/${SLUG}`} />
  }

  const { hero, layout } = page

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

  const signupSection = (
    <section className="py-16 px-4 bg-amber-700/10 dark:bg-amber-900/20">
      <div className="max-w-md mx-auto">
        <NewsletterSignup variant="page" />
      </div>
    </section>
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article className="pt-16 pb-24">
        <Suspense>
          <ConfirmationBanner />
        </Suspense>
        <PageClient />
        <PayloadRedirects disableNotFound url={`/${SLUG}`} />
        <RenderHero {...hero} />
        <RenderBlocks
          blocks={layout}
          locale={locale}
          url={fullUrl}
          insertAtIndex={3}
          insertNode={signupSection}
        />
      </article>
    </>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale = 'en' } = await params
  const page = await fetchPayloadData('pages', SLUG, locale)
  return generateMeta({ doc: page, locale })
}
