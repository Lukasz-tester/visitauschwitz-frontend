'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'

export function ConfirmationBanner() {
  const locale = useLocale()
  const t = useTranslations()
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setConfirmed(params.get('confirmed') === 'true')
  }, [])

  if (!confirmed) return null

  const pdfUrl = `/api/cms/checklist-print?locale=${locale}`

  return (
    <section className="bg-green-900/80 dark:bg-green-900/20 border-b border-green-400/40 py-10 px-4 text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-serif font-medium mb-2">
          {t('newsletter-confirmed-heading')}
        </h2>
        <p className="text-green-100 mb-6">{t('newsletter-confirmed-subtext')}</p>
        <div className="px-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <a href={pdfUrl}>{t('newsletter-confirmed-download')}</a>
          </Button>
          <Button asChild className="border-white text-white">
            <Link href="/checklist/">{t('newsletter-confirmed-view')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
