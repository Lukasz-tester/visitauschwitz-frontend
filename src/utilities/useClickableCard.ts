'use client'

import type { RefObject } from 'react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'

type UseClickableCardType<T extends HTMLElement> = {
  card: { ref: RefObject<T | null> }
  link: { ref: RefObject<HTMLAnchorElement | null> }
}

interface Props {
  external?: boolean
  newTab?: boolean
  scroll?: boolean
}

function useClickableCard<T extends HTMLElement>({
  external = false,
  newTab = false,
  scroll = true,
}: Props): UseClickableCardType<T> {
  const router = useRouter()
  const locale = useLocale()
  const card = useRef<T>(null)
  const link = useRef<HTMLAnchorElement>(null)
  const timeDown = useRef<number>(0)
  const hasActiveParent = useRef<boolean>(false)
  const pressedButton = useRef<number>(0)

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!e.target) return
    const target = e.target as Element
    const timeNow = Date.now()
    const parent = target?.closest('a')
    pressedButton.current = e.button

    if (!parent) {
      hasActiveParent.current = false
      timeDown.current = timeNow
    } else {
      hasActiveParent.current = true
    }
  }, [])

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!link.current?.href) return
      const timeNow = Date.now()
      const diff = timeNow - timeDown.current

      if (diff > 250) return
      if (hasActiveParent.current) return
      if (pressedButton.current !== 0) return
      if (e.ctrlKey) return

      // ---- START: robust locale-prefixing logic (only) ----
      try {
        // prefer the raw href attribute if present (keeps relative values)
        const rawHrefAttr = link.current.getAttribute('href')
        const raw = rawHrefAttr ?? link.current.href // link.current.href is absolute

        // Detect same-origin / internal vs external
        const origin = window.location.origin
        const isAbsoluteSameOrigin = raw.startsWith(origin)
        const isExternal = raw.startsWith('http') && !isAbsoluteSameOrigin

        if (external && isExternal) {
          // if external flag requested, open externally (preserve original behavior)
          const target = newTab ? '_blank' : '_self'
          window.open(raw, target)
          return
        }

        // If external (different origin) and not `external` flag, fallback to router.push with full URL (original behaviour)
        if (isExternal && !external) {
          router.push(raw, { scroll })
          return
        }

        // Now handle internal / same-origin links (or relative links)
        // Derive a clean path (no origin)
        let path: string
        if (isAbsoluteSameOrigin) {
          path = raw.slice(origin.length) || '/'
        } else {
          // raw may be: '/posts/slug', 'posts/slug', '#anchor', or '/en/posts/...'
          path = raw
        }

        // If it's a hash-only link, navigate to current pathname + hash
        if (path.startsWith('#')) {
          const currentPath = window.location.pathname
          const candidate = `${currentPath}${path}`
          // ensure locale prefix exists
          const needsPrefix =
            !candidate.startsWith(`/${locale}/`) && !candidate.startsWith(`/${locale}`)
          const normalized = needsPrefix
            ? `/${locale}${candidate.startsWith('/') ? candidate : `/${candidate}`}`
            : candidate
          router.push(normalized, { scroll })
          return
        }

        // Normalize path to start with '/'
        if (!path.startsWith('/')) path = `/${path}`

        // If path already has locale prefix, use it as-is
        if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
          router.push(path, { scroll })
          return
        }

        // Otherwise prefix locale
        const normalizedPath = `/${locale}${path}`
        router.push(normalizedPath, { scroll })
        return
      } catch (err) {
        // fallback to original behavior if anything unexpected happens
        router.push(link.current!.href, { scroll })
        return
      }
      // ---- END: locale-prefixing logic ----
    },
    [router, locale, external, newTab, scroll],
  )

  useEffect(() => {
    const cardNode = card.current
    if (cardNode) {
      cardNode.addEventListener('mousedown', handleMouseDown)
      cardNode.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      if (cardNode) {
        cardNode.removeEventListener('mousedown', handleMouseDown)
        cardNode.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [handleMouseDown, handleMouseUp])

  return {
    card: { ref: card },
    link: { ref: link },
  }
}

export default useClickableCard
