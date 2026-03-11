'use client'

import { useEffect } from 'react'
import { getConsentPreferences } from './CookieConsent'

const GA_ID = 'G-XR28GR07KB'

function injectGA() {
  if (!GA_ID || document.querySelector(`script[data-ga="${GA_ID}"]`)) return

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
  document.querySelectorAll(`script[data-ga="${GA_ID}"]`).forEach((el) => el.remove())

  // Clear GA cookies
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
  if (getConsentPreferences()?.analytics) {
    injectGA()
  } else {
    removeGA()
  }
}

export function Analytics() {
  useEffect(() => {
    // Initial sync
    sync()

    // React to consent changes
    window.addEventListener('cookie-consent-changed', sync)
    return () => window.removeEventListener('cookie-consent-changed', sync)
  }, [])

  return null
}
