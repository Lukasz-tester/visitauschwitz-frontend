'use client'

import { useTranslations } from 'next-intl'
import { ContactForm } from '@/components/ContactForm'

export function HomepageNewsletter() {
  const t = useTranslations()

  return (
    <>
      <div className="h-12 bg-card-foreground" />
      <section className="py-16 px-4 bg-amber-700/10 dark:bg-amber-900/20">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('contact-form-heading')}</h2>
          <p className="text-muted-foreground mb-6">{t('contact-form-subheading')}</p>
          <ContactForm variant="homepage" />
        </div>
      </section>
    </>
  )
}
