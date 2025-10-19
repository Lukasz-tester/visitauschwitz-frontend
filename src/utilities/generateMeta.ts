import { Metadata } from 'next'
import { mergeOpenGraph } from './mergeOpenGraph'
import type { Page, Post } from '../payload-types'
import { locales } from '@/i18n/localization'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.visitauschwitz.info'

const getSafeSlug = (doc: Page | Post): string => {
  const rawSlug = Array.isArray(doc?.slug) ? doc.slug.join('/') : doc?.slug
  if (!rawSlug || rawSlug === 'home') return ''
  const isPost = 'layout' in doc === false
  return isPost ? `posts/${rawSlug}` : rawSlug
}

export const generateMeta = async ({
  doc,
  locale,
}: {
  doc: Page | Post
  locale: string
}): Promise<Metadata & { logo?: string }> => {
  const date = new Date()

  const title = doc?.meta?.title
    ? `${doc.meta.title} | ${date.getFullYear()}`
    : `Auschwitz Visitor Information | ${date.getFullYear()}`

  const safeSlug = getSafeSlug(doc)

  const formatUrl = (lng: string) =>
    `${baseUrl}/${lng}/${safeSlug}`.replace(/([^:]\/)\/+/g, '$1').replace(/\/$/, '')

  const canonicalUrl = formatUrl(locale)

  // compute ogImage (absolute URL) if doc.meta.image exists
  const ogImage =
    typeof doc?.meta?.image === 'object' &&
    doc.meta.image !== null &&
    'url' in doc.meta.image &&
    doc.meta.image.url
      ? `${baseUrl}${doc.meta.image.url}`
      : undefined

  // set ogLogo to the same image when available
  const ogLogo = ogImage ?? undefined

  const languages = Object.fromEntries(locales.map((lng) => [lng, formatUrl(lng)]))
  languages['x-default'] = formatUrl('en')

  return {
    description: doc?.meta?.description,
    title,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage ? [{ url: ogImage }] : undefined,
      title,
      url: canonicalUrl,
    }),
    // optional top-level logo you can render into Head
    logo: ogLogo,
  }
}
