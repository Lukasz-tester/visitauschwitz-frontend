// app/[locale]/posts/[slug]/page.tsx
export const revalidate = false
export const dynamic = 'force-static'

import type { Metadata } from 'next'
import React from 'react'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { AuthorBio } from '@/components/AuthorBio'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { cache } from 'react'
import { fetchPayloadData } from '@/utilities/fetchPayloadData'

const getCachedPayload = cache(fetchPayloadData)
import type { Post } from '@/payload-types'
import type { TypedLocale } from '@/payload-types'
import PageClient from '../../[slug]/page.client'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { ShareButtons } from '@/components/ShareButtons'
import { locales } from '@/i18n/localization'
import { buildPostGraph, type SchemaNavItem } from '@/utilities/buildSchema'
import { getHeroImageUrl } from '@/utilities/getHeroImageUrl'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Header } from '@/payload-types'

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
  const post = await getCachedPayload('posts', slug, locale)

  if (!post) {
    return <PayloadRedirects url={url} />
  }

  const { layout } = post
  const heroImageUrl = getHeroImageUrl(post as Post)

  const header = await getCachedGlobal<Header>('header', 1, locale)()
  const navItems = (header?.navItems ?? []) as SchemaNavItem[]

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
    navItems,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article className="pt-3 md:pt-1 pb-16">
        {heroImageUrl && <link rel="preload" as="image" href={heroImageUrl} />}
        <PageClient />
        <PayloadRedirects disableNotFound url={url} />
        <PostHero post={post as Post} />

        <div className="container max-w-[50rem] pt-8">
          <RenderBlocks blocks={layout} locale={locale} url={fullUrl} />
        </div>

        <ShareButtons
          url={fullUrl}
          title={(post as Post).title}
          className="container max-w-[50rem] pt-9 text-sm"
        />

        {post.populatedAuthors && post.populatedAuthors.length > 0 && (
          <AuthorBio authors={post.populatedAuthors} />
        )}

        {((post as Post).relatedPosts ?? []).length > 0 && (
          <RelatedPosts
            className="mt-12"
            docs={((post as Post).relatedPosts ?? []).filter((p) => typeof p === 'object')}
          />
        )}
      </article>
    </>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug, locale = 'en' } = await params
  const post = await getCachedPayload('posts', slug, locale)
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
