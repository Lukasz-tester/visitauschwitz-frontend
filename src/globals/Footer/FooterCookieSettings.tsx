'use client'

import { useTranslations } from 'next-intl'
import { CookieSettingsButton } from '@/components/Cookies/CookieSettingsButton'

export function FooterCookieSettings() {
  const t = useTranslations('cookies.banner')

  return <CookieSettingsButton label={t('settings')} />
}
