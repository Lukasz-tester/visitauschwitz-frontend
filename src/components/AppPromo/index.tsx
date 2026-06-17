'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'
import { cn } from 'src/utilities/cn'
import { APPS, type AppKey } from '@/config/apps'

// Fires only after analytics consent (window.gtag is injected by the cookie
// consent flow). No-op otherwise, so it stays GDPR-safe.
function trackAppClick(app: AppKey, action: string) {
  if (typeof window === 'undefined') return
  ;(window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'app_cta_click', {
    app,
    action,
  })
}

type Props = {
  appKey: AppKey
  variant?: 'hero' | 'compact'
  className?: string
}

/**
 * Reusable promo for one of Łukasz's apps. Copy comes from the
 * `appPromo.<appKey>` next-intl namespace; store/status from src/config/apps.
 * `hero` = full landing section; `compact` = inline CTA card.
 */
export function AppPromo({ appKey, variant = 'hero', className }: Props) {
  const t = useTranslations('appPromo')
  const app = APPS[appKey]
  const isLive = app.status === 'live'

  const name = t(`${appKey}.name`)
  const tagline = t(`${appKey}.tagline`)

  if (variant === 'compact') {
    return (
      <aside className={cn('rounded-xl border border-border bg-card p-5 flex flex-col gap-2', className)}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-lg">{name}</span>
          {!isLive && (
            <span className="text-xs uppercase tracking-wide rounded-full bg-amber-700/15 text-amber-700 px-2 py-0.5">
              {t('badge-coming-soon')}
            </span>
          )}
        </div>
        <p className="opacity-80">{tagline}</p>
        <Link
          href={app.href}
          onClick={() => trackAppClick(appKey, 'compact-learn-more')}
          className="mt-1 font-semibold text-amber-700 hover:underline"
        >
          {t('learn-more')} →
        </Link>
      </aside>
    )
  }

  const description = t(`${appKey}.description`)
  const features = t.raw(`${appKey}.features`) as string[]

  return (
    <section className={cn('max-w-2xl mx-auto flex flex-col gap-6', className)}>
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">{name}</h1>
          {!isLive && (
            <span className="text-sm uppercase tracking-wide rounded-full bg-amber-700/15 text-amber-700 px-3 py-1">
              {t('badge-coming-soon')}
            </span>
          )}
        </div>
        <p className="text-xl opacity-80">{tagline}</p>
      </header>

      <p className="text-lg">{description}</p>

      {Array.isArray(features) && features.length > 0 && (
        <ul className="flex flex-col gap-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden className="mt-1 text-amber-700">
                ✓
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        {isLive && app.iosUrl && (
          <a
            href={app.iosUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAppClick(appKey, 'ios')}
            className="btn-living rounded-xl px-5 py-3 font-semibold no-underline"
          >
            {t('download-ios')}
          </a>
        )}
        {isLive && app.androidUrl && (
          <a
            href={app.androidUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAppClick(appKey, 'android')}
            className="btn-living rounded-xl px-5 py-3 font-semibold no-underline"
          >
            {t('download-android')}
          </a>
        )}
        {!isLive && (
          <Link
            href="/newsletter"
            onClick={() => trackAppClick(appKey, 'notify')}
            className="btn-living rounded-xl px-5 py-3 font-semibold no-underline"
          >
            {t('notify')}
          </Link>
        )}
      </div>
    </section>
  )
}
