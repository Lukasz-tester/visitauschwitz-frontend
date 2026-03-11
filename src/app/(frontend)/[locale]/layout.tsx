import './globals.css'
import type { Metadata } from 'next'
export const revalidate = false
export const dynamic = 'force-static'
import React from 'react'

import { Footer } from '@/globals/Footer/Component'
import { Header } from '@/globals/Header/Component'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import type { TypedLocale } from '@/payload-types'

import { getMessages, setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { CookieConsent } from '@/components/Cookies/CookieConsent'
import { Analytics } from '@/components/Cookies/Analytics'
import { NewsletterPopup } from '@/components/NewsletterSignup/NewsletterPopup'

type Args = {
  children: React.ReactNode
  params: Promise<{
    locale: TypedLocale
  }>
}

export default async function RootLayout({ children, params }: Args) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Inline theme init — runs synchronously before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('payload-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';localStorage.setItem('payload-theme',t)}document.documentElement.setAttribute('data-theme',t)})()`,
          }}
        />
        <link href="/icon.ico" rel="icon" sizes="32x32" />
      </head>
      <body>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <Header locale={locale} />
            {children}
            <Footer locale={locale} />
            <CookieConsent />
            <NewsletterPopup />
          </NextIntlClientProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  icons: {
    apple: '/apple-touch-icon.png',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'visitauschwitz.info'),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@visitauschwitz',
  },
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
