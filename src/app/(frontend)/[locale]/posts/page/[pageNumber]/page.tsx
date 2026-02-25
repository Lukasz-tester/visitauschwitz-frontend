// app/[locale]/posts/[pageNumber]/page.tsx

export const revalidate = false
export const dynamic = 'force-static'

import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { getTranslations } from 'next-intl/server'
import type { TypedLocale } from '@/payload-types'
import type { Post } from '@/payload-types'
import { locales } from '@/i18n/localization'
import { cmsFetchJSON } from '@/utilities/cmsFetch'

type Args = {
  params: Promise<{
    locale: TypedLocale
    pageNumber: string
  }>
}

export default async function Page({ params }: Args) {
  const { pageNumber, locale = 'en' } = await params
  const t = await getTranslations({ locale })

  const page = Number(pageNumber)
  if (!Number.isInteger(page) || page < 1) notFound()

  const posts = await cmsFetchJSON<{
    docs: Post[]
    page: number
    totalDocs: number
    totalPages: number
  }>(`/api/posts?limit=12&page=${page}&locale=${locale}`)

  if (!posts?.docs?.length) notFound()

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{t('posts')}</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs as Post[]} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { pageNumber, locale = 'en' } = await params
  const title = locale === 'pl' ? `Posty – Strona ${pageNumber}` : `Posts – Page ${pageNumber}`
  return {
    title: `Visiting Auschwitz – ${title}`,
  }
}

export async function generateStaticParams() {
  const data = await cmsFetchJSON<{ totalPages?: number }>('/api/posts?limit=12')
  if (!data) return []

  const pages: { locale: string; pageNumber: string }[] = []
  for (const locale of locales) {
    for (let i = 1; i <= (data.totalPages ?? 1); i++) {
      pages.push({ locale, pageNumber: String(i) })
    }
  }

  return pages
}
