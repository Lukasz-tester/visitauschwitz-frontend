'use client'

import { useTranslations } from 'next-intl'

export function FooterContactButton() {
  const t = useTranslations()

  return (
    <button
      onClick={() => window.dispatchEvent(new Event('open-contact-form'))}
      className="text-white/80 font-semibold hover:text-amber-700 ease-in-out duration-500"
    >
      {t('contact')}
    </button>
  )
}
