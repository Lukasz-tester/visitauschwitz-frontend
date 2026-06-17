import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { AppLegalArticle } from '@/components/AppLegalArticle'
import type { Locale } from '@/i18n/localization'
import { routing } from '@/i18n/routing'
import { formatLegalUpdated, getAppLegalDoc } from '@/utilities/appLegal'

type Props = { params: Promise<{ locale: Locale }> }

const KIND = 'terms' as const

const TITLE: Record<string, string> = {
  en: 'Terms of Use',
  pl: 'Regulamin',
}
const DESCRIPTION: Record<string, string> = {
  en: 'Terms of use for the Auschwitz Guidebook mobile app.',
  pl: 'Regulamin aplikacji mobilnej Przewodnik po Auschwitz.',
}
const UNAVAILABLE: Record<string, string> = {
  en: 'This document is being prepared and will be available shortly.',
  pl: 'Ten dokument jest w przygotowaniu i będzie dostępny wkrótce.',
}

const pick = (map: Record<string, string>, locale: string) =>
  map[locale] ?? map.en

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const languages: Record<string, string> = {}
  for (const loc of routing.locales) languages[loc] = `/${loc}/guidebook-app/${KIND}`
  languages['x-default'] = `/en/guidebook-app/${KIND}`
  return {
    title: pick(TITLE, locale),
    description: pick(DESCRIPTION, locale),
    alternates: { canonical: `/${locale}/guidebook-app/${KIND}`, languages },
    robots: { index: true, follow: true },
  }
}

export default async function AppTermsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const doc = getAppLegalDoc(locale, KIND)
  return (
    <AppLegalArticle
      title={pick(TITLE, locale)}
      doc={doc}
      unavailable={pick(UNAVAILABLE, locale)}
      updated={formatLegalUpdated(doc, locale)}
    />
  )
}
