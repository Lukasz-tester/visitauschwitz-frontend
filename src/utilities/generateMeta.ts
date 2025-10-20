import { Metadata } from 'next'
import { mergeOpenGraph } from './mergeOpenGraph'
import type { Page, Post } from '../payload-types'
import { locales } from '@/i18n/localization'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.visitauschwitz.info'
const r2BaseUrl = process.env.NEXT_PUBLIC_CF_R2_URL || 'https://images.visitauschwitz.info'

// ✅ Helper: safely join base and path with exactly one slash
const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`

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

  // ✅ Safely compute og:image
  let ogImage: string | undefined
  const metaImage = doc?.meta?.image

  if (metaImage && typeof metaImage === 'object') {
    if ('filename' in metaImage && typeof metaImage.filename === 'string') {
      const filename = metaImage.filename
      const webpFilename = filename.endsWith('.webp')
        ? filename
        : filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')

      ogImage = joinUrl(r2BaseUrl, webpFilename)
    } else if ('url' in metaImage && typeof metaImage.url === 'string') {
      ogImage = joinUrl(baseUrl, metaImage.url)
    }
  }

  // ✅ Use same image for og:logo
  const ogLogo = ogImage

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
    logo: ogLogo, // TODO - does not show up?
  }
}
