// app/[locale]/posts/[slug]/page.tsx
export const revalidate = false
export const dynamic = 'force-static'

import type { Metadata } from 'next'
import React from 'react'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { fetchPayloadData } from '@/utilities/fetchPayloadData'
import type { Post } from '@/payload-types'
import type { TypedLocale } from '@/payload-types'
import PageClient from '../../[slug]/page.client'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { locales } from '@/i18n/localization'
import { buildPostGraph } from '@/utilities/buildSchema'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.visitauschwitz.info'

type Args = {
  params: Promise<{
    slug: string
    locale: TypedLocale
  }>
}

export default async function PostPage({ params }: Args) {
  const { slug, locale = 'en' } = await params
  const url = `/posts/${slug}`
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.visitauschwitz.info'
  const fullUrl = `${siteUrl}/${locale}/posts/${slug}`

  // Use the helper (static-generation friendly)
  const post = await fetchPayloadData('posts', slug, locale)

  if (!post) {
    return <PayloadRedirects url={url} />
  }

  const { layout } = post

  const homeLabel = locale === 'pl' ? 'Strona główna' : 'Home'
  const blogLabel = locale === 'pl' ? 'Blog' : 'Blog'
  const schema = buildPostGraph({
    post: post as Post,
    locale,
    slug,
    breadcrumbItems: [
      { name: homeLabel, url: `${baseUrl}/` },
      { name: blogLabel, url: `${baseUrl}/${locale}/posts` },
      { name: (post as Post).title, url: fullUrl },
    ],
  })

  return (
    <article className="pt-16 pb-16">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      <PostHero post={post as Post} />

      <div className="container max-w-[50rem] pt-8">
        <RenderBlocks blocks={layout} locale={locale} url={fullUrl} />
      </div>

      {((post as Post).relatedPosts ?? []).length > 0 && (
        <RelatedPosts
          className="mt-12"
          docs={((post as Post).relatedPosts ?? []).filter((p) => typeof p === 'object')}
        />
      )}
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug, locale = 'en' } = await params
  const post = await fetchPayloadData('posts', slug, locale)
  if (!post) return {}
  return generateMeta({ doc: post, locale })
}

export async function generateStaticParams() {
  const { cmsFetchJSON } = await import('@/utilities/cmsFetch')
  const data = await cmsFetchJSON<{ docs?: { slug?: string }[] }>('/api/posts?limit=1000')
  if (!data) return []

  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) {
    for (const post of data.docs ?? []) {
      if (post.slug) params.push({ locale, slug: post.slug })
    }
  }
  return params
}
