'use client'

import { useTranslations } from 'next-intl'
import { NewsletterSignup } from '@/components/NewsletterSignup'

export function FooterNewsletter() {
  const t = useTranslations()

  return (
    <div className="pt-5 pb-4">
      <h3 className="text-white/80 text-xl font-semibold mb-4">
        {t('newsletter-heading')}
      </h3>
      <NewsletterSignup variant="footer" />
    </div>
  )
}
