'use client'

import { useEffect, useState, useCallback } from 'react'
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
    if (c.indexOf(nameEQ) === 0)
      return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  return null
}

export function getConsentPreferences(): ConsentPreferences | null {
  const raw = getCookie(COOKIE_NAME)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ConsentPreferences
  } catch {
    // Legacy format ("true"/"false") — treat as no consent
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
  const [analyticsOn, setAnalyticsOn] = useState(false)
  const tBanner = useTranslations('cookies.banner')
  const tSettings = useTranslations('cookies.settings')

  useEffect(() => {
    if (!getConsentPreferences()) {
      setView('banner')
    }
  }, [])

  useEffect(() => {
    const handler = () => {
      const prefs = getConsentPreferences()
      setAnalyticsOn(prefs?.analytics ?? false)
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
    setView('settings')
  }, [])

  const saveSettings = useCallback(() => {
    savePreferences({ analytics: analyticsOn })
    setView(null)
  }, [analyticsOn])

  if (!view) return null

  const btnBase =
    'px-5 py-2.5 text-sm font-medium rounded-lg border border-border transition-colors cursor-pointer'
  const btnHover = 'hover:bg-white/10'

  return (
    <div className="fixed inset-0 z-[100001] flex items-end justify-center p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {view === 'settings' && (
        <div
          className="fixed inset-0 bg-black/30"
          onClick={saveSettings}
          aria-hidden="true"
        />
      )}

      <div className="relative max-w-xl w-full bg-black/95 text-white/90 p-6 border border-white/10 rounded-xl shadow-lg">
        {view === 'banner' && (
          <>
            <p className="text-sm text-white/70 mb-4">
              {tBanner('message')}{' '}
              <Link
                href="/privacy"
                className="underline hover:text-white transition-colors"
              >
                {tBanner('privacyLink')}
              </Link>{' '}
              <Link
                href="/terms"
                className="underline hover:text-white transition-colors"
              >
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
                className="text-xs text-white/50 underline hover:text-white transition-colors self-center sm:self-auto"
              >
                {tBanner('settings')}
              </button>
            </div>
          </>
        )}

        {view === 'settings' && (
          <>
            <h2 className="text-base font-semibold mb-4">{tSettings('title')}</h2>

            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="pr-4">
                <p className="text-sm font-medium">{tSettings('necessary.name')}</p>
                <p className="text-xs text-white/50 mt-0.5">
                  {tSettings('necessary.description')}
                </p>
              </div>
              <Toggle checked disabled />
            </div>

            <div className="flex items-center justify-between py-3 mb-4">
              <div className="pr-4">
                <p className="text-sm font-medium">{tSettings('analytics.name')}</p>
                <p className="text-xs text-white/50 mt-0.5">
                  {tSettings('analytics.description')}
                </p>
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
