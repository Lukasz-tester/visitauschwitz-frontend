'use client'

import { useEffect } from 'react'
import { getConsentPreferences } from './CookieConsent'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

// Google's official opt-out mechanism: setting this window property
// stops gtag from sending any hits for this measurement ID.
const GA_DISABLE_KEY = `ga-disable-${GA_ID}`

function injectGA() {
  if (!GA_ID || document.querySelector(`script[data-ga="${GA_ID}"]`))
    return // Lift the disable flag before loading
  ;(window as unknown as Record<string, unknown>)[GA_DISABLE_KEY] = undefined

  const loader = document.createElement('script')
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  loader.async = true
  loader.setAttribute('data-ga', GA_ID)
  document.head.appendChild(loader)

  const inline = document.createElement('script')
  inline.setAttribute('data-ga', GA_ID)
  inline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  `
  document.head.appendChild(inline)
}

function removeGA() {
  // Disable GA's tracking engine — this is the only reliable way to stop
  // an already-loaded GA from sending hits. Removing <script> elements
  // does NOT stop the JS that has already executed.
  ;(window as unknown as Record<string, unknown>)[GA_DISABLE_KEY] = true

  // Remove script elements to prevent re-execution
  document.querySelectorAll(`script[data-ga="${GA_ID}"]`).forEach((el) => el.remove())

  // Clear GA cookies (_ga, _ga_<ID>, _gid, etc.)
  document.cookie.split(';').forEach((c) => {
    const name = c.split('=')[0].trim()
    if (name.startsWith('_ga') || name === '_gid') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  })
  ;(window as unknown as Record<string, unknown>)['dataLayer'] = undefined
  ;(window as unknown as Record<string, unknown>)['gtag'] = undefined
}

function sync() {
  const prefs = getConsentPreferences()
  // null = first visit, no decision yet — treat as denied (GDPR default)
  if (prefs?.analytics) {
    injectGA()
  } else {
    removeGA()
  }
}

export function Analytics() {
  useEffect(() => {
    if (!GA_ID) return

    // Defer GA loading to improve initial page load performance
    const timer = setTimeout(() => {
      // Pre-emptively block GA before anything else runs. This ensures
      // that even if a third-party script somehow triggers gtag before
      // sync() completes, no hits are sent without explicit consent.
      if (!getConsentPreferences()?.analytics) {
        ;(window as unknown as Record<string, unknown>)[GA_DISABLE_KEY] = true
      }

      sync()

      window.addEventListener('cookie-consent-changed', sync)
    }, 2000)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('cookie-consent-changed', sync)
    }
  }, [])

  return null
}
