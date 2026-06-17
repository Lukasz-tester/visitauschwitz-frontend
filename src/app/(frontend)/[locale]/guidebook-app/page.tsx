import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { AppPromo } from '@/components/AppPromo'
import type { Locale } from '@/i18n/localization'
import { routing } from '@/i18n/routing'

type Props = { params: Promise<{ locale: Locale }> }

const TITLE: Record<string, string> = {
  en: 'Auschwitz Guidebook App',
  pl: 'Aplikacja Przewodnik po Auschwitz',
}
const DESCRIPTION: Record<string, string> = {
  en: 'A free, offline, self-guided companion app for visiting the Auschwitz-Birkenau Memorial.',
  pl: 'Bezpłatna, działająca offline aplikacja-towarzysz samodzielnego zwiedzania Miejsca Pamięci Auschwitz-Birkenau.',
}

const pick = (map: Record<string, string>, locale: string) => map[locale] ?? map.en

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const languages: Record<string, string> = {}
  for (const loc of routing.locales) languages[loc] = `/${loc}/guidebook-app`
  languages['x-default'] = `/en/guidebook-app`
  return {
    title: pick(TITLE, locale),
    description: pick(DESCRIPTION, locale),
    alternates: { canonical: `/${locale}/guidebook-app`, languages },
    robots: { index: true, follow: true },
  }
}

export default async function GuidebookAppPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <main className="container py-12 md:py-20">
      <AppPromo appKey="guidebook" variant="hero" />
    </main>
  )
}
