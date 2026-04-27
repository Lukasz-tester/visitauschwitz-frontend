'use client'

import React from 'react'
import { cn } from 'src/utilities/cn'
import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

type Props = {
  className?: string
  onClick?: () => void
}

export const DonationCard: React.FC<Props> = ({ className, onClick }) => {
  const locale = useLocale()
  const t = useTranslations()

  return (
    <div
      className={cn(
        ' rounded-xl bg-white/80 dark:bg-black/80 p-5 border border-amber-600/20',
        className,
      )}
    >
      <Link
        href={`https://donate.stripe.com/bJefZhe8d04jgclgDL0Fi01?locale=${locale}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="w-full mb-3 bg-orange-600/30 dark:bg-amber-800/40 hover:opacity-90 text-base font-medium py-2 px-4 rounded-lg transition-colors text-center block"
      >
        {t('support-mission')}
      </Link>
      <Link
      href="/support" className="opacity-70" onClick={onClick}
      >
        {t('support-banner-text')}
      </Link>
          </div>
  )
}
