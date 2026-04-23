'use client'

import type { StaticImageData } from 'next/image'
import NextImage from 'next/image'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from 'src/utilities/cn'
import type { Props as MediaProps } from '../types'

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    imgClassName,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
  } = props

  const [isLoaded, setIsLoaded] = useState(false)
  const [isCached, setIsCached] = useState(false)
  const handleLoad = useCallback(() => setIsLoaded(true), [])

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, filename, height: h, width: w } = resource

    width = w ?? undefined
    height = h ?? undefined
    alt = altFromResource

    // Serve WebP from Cloudflare R2
    const webpFilename = filename?.replace(/\.(jpg|jpeg)$/i, '.webp')
    src = `${process.env.NEXT_PUBLIC_CF_R2_URL}${webpFilename}`
  }

  // Check if this image has been loaded before using sessionStorage or browser cache
  const cacheCheckKey = useMemo(() => `img-loaded-${src}`, [src])
  
  useEffect(() => {
    if (src && typeof src === 'string') {
      // First check sessionStorage
      const hasLoadedBefore = sessionStorage.getItem(cacheCheckKey)
      if (hasLoadedBefore) {
        setIsLoaded(true)
        setIsCached(true)
        return
      }

      // Check if image is in browser cache using Image API
      const img = new Image()
      img.src = src
      
      const checkCache = () => {
        if (img.complete) {
          setIsLoaded(true)
          setIsCached(true)
          sessionStorage.setItem(cacheCheckKey, 'true')
        }
      }
      
      // Check immediately in case it's already loaded
      checkCache()
      
      // Also check on load in case it's loading from cache
      img.onload = checkCache
    }
  }, [src, cacheCheckKey])

  // Store in sessionStorage when image loads
  useEffect(() => {
    if (isLoaded && src && typeof src === 'string') {
      sessionStorage.setItem(cacheCheckKey, 'true')
    }
  }, [isLoaded, src, cacheCheckKey])

  if (!alt) console.warn('ImageMedia rendered without alt text:', src)

  const sizes =
    sizeFromProps ||
    `
    (max-width: 768px) 100vw,
    (max-width: 1024px) 100vw,
    (max-width: 1440px) 90vw,
    1440px
  `.trim()

  return (
    <NextImage
      alt={alt || 'Image'}
      className={cn(
        isCached ? '' : 'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        imgClassName,
      )}
      fill={fill}
      height={!fill ? height : undefined}
      width={!fill ? width : undefined}
      priority={priority}
      sizes={sizes}
      src={src}
      loading={priority ? 'eager' : 'lazy'}
      unoptimized={true}
      onLoad={handleLoad}
    />
  )
}

export const ImageMediaMemo = React.memo(ImageMedia)
