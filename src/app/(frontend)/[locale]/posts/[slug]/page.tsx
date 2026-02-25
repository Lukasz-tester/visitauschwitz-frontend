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

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.visitauschwitz.info'
const r2BaseUrl = process.env.NEXT_PUBLIC_CF_R2_URL || 'https://images.visitauschwitz.info'

function buildArticleSchema(post: Post, locale: string, slug: string) {
  const metaImage = post.meta?.image
  let image: string | undefined

  if (metaImage && typeof metaImage === 'object') {
    if ('filename' in metaImage && typeof metaImage.filename === 'string') {
      const webpFilename = metaImage.filename.endsWith('.webp')
        ? metaImage.filename
        : metaImage.filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      image = `${r2BaseUrl}/${webpFilename}`
    } else if ('url' in metaImage && typeof metaImage.url === 'string') {
      image = metaImage.url.startsWith('http')
        ? metaImage.url
        : `${baseUrl}${metaImage.url}`
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    ...(post.meta?.description ? { description: post.meta.description } : {}),
    ...(image ? { image } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...((post as any).updatedAt ? { dateModified: (post as any).updatedAt } : {}),
    ...(post.populatedAuthors?.length
      ? {
          author: post.populatedAuthors.map((a: any) => ({
            '@type': 'Person',
            name: a.name,
          })),
        }
      : {}),
    publisher: {
      '@type': 'Organization',
      name: 'Auschwitz Visiting Guide',
      url: baseUrl,
    },
    url: `${baseUrl}/${locale}/posts/${slug}`,
    inLanguage: locale,
  }
}

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

  const articleSchema = buildArticleSchema(post as Post, locale, slug)

  return (
    <article className="pt-16 pb-16">
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(articleSchema)}
      </script>
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
  const res = await fetch(
    `${process.env.CMS_PUBLIC_SERVER_URL ?? 'https://example.com'}/api/posts?limit=1000`,
  )

  if (!res.ok) {
    console.error('Failed to fetch posts for static params')
    return []
  }

  const data = await res.json()
  const posts = data.docs ?? []

  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) {
    for (const post of posts) {
      if (post.slug) params.push({ locale, slug: post.slug })
    }
  }

  return params
}
