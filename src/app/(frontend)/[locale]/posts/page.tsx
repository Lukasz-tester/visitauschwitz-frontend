// app/[locale]/posts/page.tsx
export const revalidate = false
export const dynamic = 'force-static'

import React from 'react'
import type { Metadata } from 'next'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { getTranslations } from 'next-intl/server'
import type { TypedLocale } from '@/payload-types'
import type { Post } from '@/payload-types'
import PageClient from '../[slug]/page.client'

type Args = {
  params: Promise<{
    locale: TypedLocale
  }>
}

export default async function Page({ params }: Args) {
  const { locale = 'en' } = await params
  const t = await getTranslations({ locale })

  // list fetch — we need pages, so use collection list endpoint
  const res = await fetch(
    `${process.env.CMS_PUBLIC_SERVER_URL ?? 'https://example.com'}/api/posts?limit=12&locale=${locale}`,
    { next: { revalidate: false } },
  )

  if (!res.ok) {
    console.error('Failed to fetch posts:', res.statusText)
    return (
      <div className="container pt-24 pb-24 text-center text-red-600">
        Error loading posts ({locale})
      </div>
    )
  }

  let posts
  try {
    posts = await res.json()
  } catch {
    console.error('Failed to parse posts response as JSON')
    return (
      <div className="container pt-24 pb-24 text-center text-red-600">
        Error loading posts ({locale})
      </div>
    )
  }

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none md:prose-h1:text-6xl opacity-90">
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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Visiting Auschwitz – Posts`,
  }
}
