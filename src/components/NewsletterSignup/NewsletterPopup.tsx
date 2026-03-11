'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getCookie } from '@/utilities/helpersSsr'
import { NewsletterSignup } from '@/components/NewsletterSignup'

const DISMISS_KEY = 'newsletter-popup-dismissed'
const SUBSCRIBED_KEY = 'newsletter-subscribed'
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function NewsletterPopup() {
  const [show, setShow] = useState(false)
  const t = useTranslations()

  useEffect(() => {
    const shouldSuppress = () => {
      if (localStorage.getItem(SUBSCRIBED_KEY) === 'true') return true
      if (!getCookie('cookie-consent')) return true
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (dismissed && Date.now() - Number(dismissed) < COOLDOWN_MS) return true
      return false
    }

    if (shouldSuppress()) return

    // Timer trigger
    const timer = setTimeout(() => setShow(true), 30000)

    // Exit-intent trigger (desktop only)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) setShow(true)
    }
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      clearTimeout(timer)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60" onClick={dismiss}>
      <div
        className="relative bg-background rounded-xl shadow-2xl max-w-md w-full mx-4 p-8"
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
