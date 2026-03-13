import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Footer, TypedLocale } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { LogoLink } from '../../components/ui/logoLink'
import { FooterNewsletter } from './FooterNewsletter'
import { FooterCookieSettings } from './FooterCookieSettings'
import { FooterContactButton } from './FooterContactButton'

export async function Footer({ locale }: { locale: TypedLocale }) {
  const footer = await getCachedGlobal<Footer>('footer', 1, locale)()

  const navItems = footer?.navItems || []

  const date = new Date()
  const year = date.getFullYear()

  return (
    <footer className="border-t border-border bg-black dark:bg-card">
      <div className="container gap-8 flex flex-col">
        <div className="flex flex-col md:flex-row md:justify-between md:gap-8">
          <nav className="py-5 px-2 flex flex-wrap content-start gap-6 text-xl">
            <FooterContactButton />
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink
                  className="text-white/80 font-semibold hover:text-amber-700 ease-in-out duration-500"
                  key={i}
                  {...link}
                />
              )
            })}
            <FooterCookieSettings />
          </nav>

          <div className="md:w-1/2 px-2">
            <FooterNewsletter />
          </div>
        </div>

        <div className="py-6 gap-5 text-sm text-white/60 flex-col flex">
          <LogoLink className="hover:text-amber-700 ease-in-out duration-500" />
          <div className="pl-1">© {year} All Rights Reserved</div>
        </div>
      </div>
    </footer>
  )
}
