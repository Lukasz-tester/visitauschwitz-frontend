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
    <section className="bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-800 py-10 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-serif font-medium mb-2">
          {t('newsletter-confirmed-heading')}
        </h2>
        <p className="text-muted-foreground mb-6">{t('newsletter-confirmed-subtext')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <a href={pdfUrl}>{t('newsletter-confirmed-download')}</a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/checklist">{t('newsletter-confirmed-view')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
