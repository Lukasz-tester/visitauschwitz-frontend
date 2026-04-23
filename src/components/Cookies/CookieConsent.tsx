'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

const COOKIE_NAME = 'cookie-consent'
const CONSENT_CHANGED_EVENT = 'cookie-consent-changed'
const SETTINGS_OPEN_EVENT = 'cookie-settings-open'

export interface ConsentPreferences {
  analytics: boolean
}

function setCookie(name: string, value: string, days = 365) {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = '; expires=' + date.toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  return null
}

export function getConsentPreferences(): ConsentPreferences | null {
  const raw = getCookie(COOKIE_NAME)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ConsentPreferences
  } catch {
    // Legacy format ("accepted"/"declined") — treat as no consent
    return null
  }
}

function savePreferences(prefs: ConsentPreferences) {
  setCookie(COOKIE_NAME, JSON.stringify(prefs))
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: prefs }))
}

type View = 'banner' | 'settings' | null

export function CookieConsent() {
  const [view, setView] = useState<View>(null)

  useEffect(() => {
    // Defer banner appearance to improve initial page load performance
    const timer = setTimeout(() => {
      if (!getConsentPreferences()) setView('banner')
    }, 2000)
    return () => clearTimeout(timer)
  }, [])
  const [analyticsOn, setAnalyticsOn] = useState(false)
  const [openedFrom, setOpenedFrom] = useState<'banner' | 'footer'>('banner')
  const tBanner = useTranslations('cookies.banner')
  const tSettings = useTranslations('cookies.settings')

  // Listen for external "open settings" event (from Footer)
  useEffect(() => {
    const handler = () => {
      const prefs = getConsentPreferences()
      setAnalyticsOn(prefs?.analytics ?? false)
      setOpenedFrom('footer')
      setView('settings')
    }
    window.addEventListener(SETTINGS_OPEN_EVENT, handler)
    return () => window.removeEventListener(SETTINGS_OPEN_EVENT, handler)
  }, [])

  const acceptAll = useCallback(() => {
    savePreferences({ analytics: true })
    setView(null)
  }, [])

  const rejectAll = useCallback(() => {
    savePreferences({ analytics: false })
    setView(null)
  }, [])

  const openSettings = useCallback(() => {
    const prefs = getConsentPreferences()
    setAnalyticsOn(prefs?.analytics ?? false)
    setOpenedFrom('banner')
    setView('settings')
  }, [])

  const saveSettings = useCallback(() => {
    savePreferences({ analytics: analyticsOn })
    setView(null)
  }, [analyticsOn])

  // Focus trap: keep Tab within the dialog
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!view) return
    const el = dialogRef.current
    if (!el) return

    const focusable = () =>
      el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const nodes = focusable()
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [view])

  if (!view) return null

  // Shared button style — equal prominence for GDPR compliance
  const btnBase =
    'px-5 py-2.5 text-sm font-medium rounded-lg border border-border transition-colors cursor-pointer'
  const btnHover = 'hover:bg-white/10'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 animate-fade-in-up">
      {/* Backdrop for settings panel */}
      {view === 'settings' && (
        <div
          className="fixed inset-0 bg-black/30"
          onClick={() => {
            if (openedFrom === 'banner') {
              setView('banner')
            } else {
              setView(null)
            }
          }}
          aria-hidden="true"
        />
      )}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="relative max-w-xl rounded-xl w-full bg-black/95 text-white/90 p-6 border border-border shadow-lg"
      >
        {view === 'banner' && (
          <>
            <p className="text-sm text-white/70 mb-4">
              {tBanner('message')}{' '}
              <Link
                href="/privacy/#cookies"
                className="underline hover:text-foreground transition-colors"
              >
                {tBanner('privacyLink')}
              </Link>{' '}
              <Link href="/terms/" className="underline hover:text-foreground transition-colors">
                {tBanner('termsLink')}
              </Link>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex gap-3 flex-1">
                <button
                  onClick={acceptAll}
                  className={`${btnBase} ${btnHover} flex-1 sm:flex-none`}
                >
                  {tBanner('acceptAll')}
                </button>
                <button
                  onClick={rejectAll}
                  className={`${btnBase} ${btnHover} flex-1 sm:flex-none`}
                >
                  {tBanner('rejectAll')}
                </button>
              </div>
              <button
                onClick={openSettings}
                className="text-xs text-muted underline hover:text-foreground transition-colors self-center sm:self-auto"
              >
                {tBanner('settings')}
              </button>
            </div>
          </>
        )}

        {view === 'settings' && (
          <>
            <h2 className="text-base font-semibold mb-4">{tSettings('title')}</h2>

            {/* Essential cookies — always on */}
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="pr-4">
                <p className="text-sm font-medium">{tSettings('necessary.name')}</p>
                <p className="text-xs text-muted mt-0.5">{tSettings('necessary.description')}</p>
              </div>
              <Toggle checked disabled />
            </div>

            {/* Analytics cookies — togglable */}
            <div className="flex items-center justify-between py-3 mb-4">
              <div className="pr-4">
                <p className="text-sm font-medium">{tSettings('analytics.name')}</p>
                <p className="text-xs text-muted mt-0.5">{tSettings('analytics.description')}</p>
              </div>
              <Toggle checked={analyticsOn} onChange={() => setAnalyticsOn((v) => !v)} />
            </div>

            <div className="flex gap-3">
              <button onClick={saveSettings} className={`${btnBase} ${btnHover}`}>
                {tSettings('save')}
              </button>
              <button onClick={acceptAll} className={`${btnBase} ${btnHover}`}>
                {tSettings('acceptAll')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* Minimal toggle switch */
function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  onChange?: () => void
}) {
  return (
    <button
      role="switch"
      type="button"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out
        ${checked ? 'bg-amber-700' : 'bg-white/20'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm
          transform transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  )
}
