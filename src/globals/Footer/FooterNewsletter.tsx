'use client'

import { useTranslations } from 'next-intl'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { Link } from '@/i18n/routing'

export function FooterNewsletter() {
  const t = useTranslations()

  return (
    <div className="pt-5 pb-4">
      <NewsletterSignup variant="footer" />
      <Link href="/newsletter" className="inline-block mt-3 text-sm text-white/50 hover:text-white/80 underline">
        {t('newsletter-learn-more')}
      </Link>
    </div>
  )
}
