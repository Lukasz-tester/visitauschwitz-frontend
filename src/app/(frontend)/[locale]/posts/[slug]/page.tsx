// app/[locale]/posts/[slug]/page.tsx
export const revalidate = false
export const dynamic = 'force-static'

import type { Metadata } from 'next'
import React from 'react'
// import { notFound } from "next/navigation";
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { fetchPayloadData } from '@/utilities/fetchPayloadData'
import type { Post } from '@/payload-types'
import type { TypedLocale } from 'payload'
import PageClient from '../../[slug]/page.client'
import { RenderBlocks } from '@/blocks/RenderBlocks'

type Args = {
  params: Promise<{
    slug: string
    locale: TypedLocale
  }>
}

export default async function PostPage({ params }: Args) {
  const { slug, locale = 'en' } = await params
  const url = `/posts/${slug}`

  // Use the helper (static-generation friendly)
  const post = await fetchPayloadData('posts', slug, locale)

  if (!post) {
    return <PayloadRedirects url={url} />
  }

  const { layout } = post

  return (
    <article className="pt-16 pb-16">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      <PostHero post={post as Post} />

      <div className="container max-w-[50rem] pt-8">
        <RenderBlocks blocks={layout} locale={locale} url={url} />
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
  const locales = ['en', 'pl']

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
