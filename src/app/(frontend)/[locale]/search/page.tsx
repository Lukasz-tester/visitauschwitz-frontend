// app/[locale]/search/page.tsx
import React from 'react'
import { getTranslations } from 'next-intl/server'
import { CollectionArchive } from '@/components/CollectionArchive'
import { Search } from '@/search/Component'
import PageClient from '../[slug]/page.client'
import { locales } from '@/i18n/localization'
import type { Metadata } from 'next'
import type { Post } from '@/payload-types'

export const revalidate = false
export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Auschwitz Visitor Info - Search Page' }
}

// generate static pages for all locales
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// ❌ Do NOT annotate the props
export default async function SearchPage({ params, searchParams }: any) {
  const { locale } = params
  const { q = '' } = searchParams ?? {}
  const t = await getTranslations({ locale })

  const res = await fetch(
    `${process.env.CMS_PUBLIC_SERVER_URL}/api/posts?locale=${locale}&limit=1000`,
    {
      cache: 'no-store',
    },
  )
  const posts: Post[] = (await res.json())?.docs ?? []

  const filtered = q
    ? posts.filter((p) =>
        [p.title, p.meta?.description, p.meta?.title, p.slug]
          .filter(Boolean)
          .some((f) => f?.toLowerCase().includes(q.toLowerCase())),
      )
    : posts.slice(0, 12)

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="sr-only">{t('search')}</h1>
          <Search />
        </div>
      </div>
      {filtered.length > 0 ? (
        <CollectionArchive posts={filtered} />
      ) : (
        <div className="container">{t('noResults') || 'No results found.'}</div>
      )}
    </div>
  )
}
