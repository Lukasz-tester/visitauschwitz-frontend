'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getConsentPreferences } from '@/components/Cookies/CookieConsent'
import { NewsletterSignup } from '@/components/NewsletterSignup'

const DISMISS_KEY = 'newsletter-popup-dismissed'
const SUBSCRIBED_KEY = 'newsletter-subscribed'
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function NewsletterPopup() {
  const [show, setShow] = useState(false)
  const suppressedRef = useRef(false)
  const activatedRef = useRef(false)
  const t = useTranslations()

  useEffect(() => {
    // Permanent suppression checks (won't change during session)
    if (localStorage.getItem(SUBSCRIBED_KEY) === 'true') {
      suppressedRef.current = true
      return
    }
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed && Date.now() - Number(dismissed) < COOLDOWN_MS) {
      suppressedRef.current = true
      return
    }

    // Activate triggers once cookie consent exists
    function activateTriggers() {
      if (activatedRef.current || suppressedRef.current) return
      activatedRef.current = true

      // Timer trigger — 30s from when consent was granted
      const timer = setTimeout(() => {
        if (!suppressedRef.current) {
          suppressedRef.current = true
          setShow(true)
        }
      }, 30000)

      // Exit-intent trigger (desktop only)
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0 && !suppressedRef.current) {
          suppressedRef.current = true
          setShow(true)
        }
      }
      document.documentElement.addEventListener('mouseleave', handleMouseLeave)

      // Exit-intent trigger (mobile: back button via History API)
      history.pushState({ newsletterGuard: true }, '', window.location.href)
      const handlePopState = () => {
        if (!suppressedRef.current) {
          suppressedRef.current = true
          setShow(true)
          history.pushState({ newsletterGuard: true }, '', window.location.href)
        }
      }
      window.addEventListener('popstate', handlePopState)

      // Store cleanup for when effect unmounts
      cleanupRef.current = () => {
        clearTimeout(timer)
        document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
        window.removeEventListener('popstate', handlePopState)
      }
    }

    const cleanupRef = { current: () => {} }

    // If cookie consent already exists, activate immediately
    if (getConsentPreferences()) {
      activateTriggers()
    } else {
      // Poll for cookie consent (user hasn't accepted yet)
      const poll = setInterval(() => {
        if (getConsentPreferences()) {
          clearInterval(poll)
          activateTriggers()
        }
      }, 1000)
      cleanupRef.current = () => clearInterval(poll)
    }

    // Listen for subscription from other tabs or from the popup's form
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SUBSCRIBED_KEY && e.newValue === 'true') {
        suppressedRef.current = true
        setShow(false)
      }
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      cleanupRef.current()
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Also check localStorage on re-renders (handles same-tab subscription)
  useEffect(() => {
    if (show && localStorage.getItem(SUBSCRIBED_KEY) === 'true') {
      suppressedRef.current = true
      setShow(false)
    }
  }, [show])

  const dismiss = () => {
    suppressedRef.current = true
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-x-0 top-0 z-[100000] flex items-center justify-center bg-black/60 h-[100dvh] overflow-y-auto"
      onClick={dismiss}
    >
      <div
        className="relative bg-background rounded-xl shadow-2xl max-w-md w-full mx-4 my-4 p-8 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-xl leading-none"
          aria-label={t('newsletter-close')}
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-2">{t('newsletter-popup-heading')}</h2>
        <p className="text-muted-foreground mb-6 text-sm">{t('newsletter-popup-subheading')}</p>
        <NewsletterSignup variant="popup" />
      </div>
    </div>
  )
}
