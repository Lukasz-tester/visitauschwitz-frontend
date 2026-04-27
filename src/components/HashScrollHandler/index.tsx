'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Fixes Safari's unreliable scroll-to-hash on cross-page navigations.
 *
 * Safari often attempts to scroll to the anchor before the new page's
 * DOM is fully laid out, landing above or below the target. This component
 * detects cross-page navigation with a hash and manually scrolls to
 * the target element once the DOM has settled.
 *
 * Back/forward (popstate) navigations are skipped so Next.js can restore
 * the saved scroll position instead of jumping to the hash section.
 */
export function HashScrollHandler() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)
  const isPopState = useRef(false)

  useEffect(() => {
    const handlePopState = () => {
      isPopState.current = true
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const isCrossPage = prevPathname.current !== pathname
    prevPathname.current = pathname

    if (isPopState.current) {
      isPopState.current = false
      return // back/forward: let Next.js restore scroll position
    }

    const hash = window.location.hash
    if (!isCrossPage || !hash) return

    const id = hash.slice(1) // remove '#'
    if (!id) return

    // Neutralize Safari's premature scroll-to-hash so our animation starts from the top
    window.scrollTo({ top: 0, behavior: 'instant' })

    // Wait for the new page to fully lay out, then animate scroll to the target
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(id)
          if (!el) return
          const target = el.getBoundingClientRect().top + window.scrollY
          const start = window.scrollY
          const distance = target - start
          const duration = 1200
          let startTime: number | null = null
          const easeInOutCubic = (t: number) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            window.scrollTo(0, start + distance * easeInOutCubic(progress))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }, 100)
      })
    })
  }, [pathname])

  return null
}
