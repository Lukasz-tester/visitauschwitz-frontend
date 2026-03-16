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
 */
export function HashScrollHandler() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    const isCrossPage = prevPathname.current !== pathname
    prevPathname.current = pathname

    const hash = window.location.hash
    if (!isCrossPage || !hash) return

    const id = hash.slice(1) // remove '#'
    if (!id) return

    // Chrome handles cross-page hash scroll correctly — only fix other browsers
    const isChrome = /Chrome\//.test(navigator.userAgent) && !/Edg\//.test(navigator.userAgent)
    if (isChrome) return

    // Immediately neutralize Safari's premature scroll to prevent the visible jump
    // window.scrollTo({ top: 0, behavior: 'instant' })

    // Wait for the new page to fully lay out, then smooth-scroll to the target
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(id)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      })
    })
  }, [pathname])

  return null
}
