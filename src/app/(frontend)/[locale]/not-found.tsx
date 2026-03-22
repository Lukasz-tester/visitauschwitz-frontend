'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-[8rem] font-bold leading-none opacity-10">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">{t('page-not-found')}</p>
      <Link
        href={`/${locale}/`}
        className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t('go-home')}
      </Link>
    </main>
  )
}
