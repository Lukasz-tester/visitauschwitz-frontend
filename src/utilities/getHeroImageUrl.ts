import type { Page, Post, Media } from '@/payload-types'

/** Extract the hero image URL for preloading. Works for both Page and Post types. */
export function getHeroImageUrl(doc: Page | Post | null): string | null {
  if (!doc) return null

  let media: Media | string | number | null | undefined

  if ('hero' in doc && doc.hero) {
    // Page type
    const { type, media: heroMedia } = doc.hero
    if (!type || type === 'none') return null
    media = heroMedia
  } else if ('meta' in doc && doc.meta?.image) {
    // Post type
    media = doc.meta.image
  }

  if (!media || typeof media !== 'object') return null

  const { filename } = media
  if (!filename) return null

  const webpFilename = filename.replace(/\.(jpg|jpeg)$/i, '.webp')
  return `${process.env.NEXT_PUBLIC_CF_R2_URL}${webpFilename}`
}
