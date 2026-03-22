'use client'

import { CMSLink } from '@/components/Link'
import type { Footer } from '@/payload-types'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { FooterContactButton } from './FooterContactButton'
import { FooterCookieSettings } from './FooterCookieSettings'

type NavItems = NonNullable<Footer['navItems']>

export function FooterNav({ navItems }: { navItems: NavItems }) {
  const t = useTranslations()
  const locale = useLocale()

  const linkClass = 'text-white/80 font-semibold hover:text-amber-700 ease-in-out duration-500'

  const renderLink = ({ link }: NavItems[number], i: number) => {
    return <CMSLink className={linkClass} key={i} {...link} />
  }

  return (
    <nav className="py-5 md:pl-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12 text-xl">
      {/* Column 1: Contact, first CMS item (Posts), Tips */}
      <div className="flex flex-col items-start gap-3">
        <Link href={`/${locale}/supplement`} className={linkClass}>
          {t('tips')}
        </Link>
        <FooterContactButton />
        {navItems[0] && renderLink(navItems[0], 0)}
      </div>

      {/* Column 2: remaining CMS items, Cookie settings */}
      <div className="flex flex-col items-start gap-3">
        {navItems.slice(1).map(renderLink)}
        <FooterCookieSettings />
      </div>
    </nav>
  )
}
