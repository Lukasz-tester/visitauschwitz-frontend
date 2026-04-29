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
        'p-5',
        // ' rounded-xl bg-white/80 dark:bg-black/80 border border-amber-600/20',
        className,
      )}
    >
      <Link
        href={`https://donate.stripe.com/bJefZhe8d04jgclgDL0Fi01?locale=${locale}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="btn-living w-full mb-3 text-base font-medium py-2 px-4 rounded-lg text-center block"
      >
        {t('support-mission')}
      </Link>
      <Link href="/support/#support-options" className="opacity-70" onClick={onClick}>
        {t('support-banner-text')}
      </Link>
    </div>
    // from-rose-600 via-orange-500 to-amber-400 dark:from-rose-700 dark:via-orange-600 dark:to-amber-600
  )
}
