'use client'

import { useTranslations } from 'next-intl'
import { NewsletterSignup } from '@/components/NewsletterSignup'

export function HomepageNewsletter() {
  const t = useTranslations()

  return (
    <section className="mt-28 py-16 px-4 bg-amber-700/10 dark:bg-amber-900/20">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          {t('newsletter-heading')}
        </h2>
        <p className="text-muted-foreground mb-6">{t('newsletter-subheading')}</p>
        <NewsletterSignup variant="homepage" />
      </div>
    </section>
  )
}
