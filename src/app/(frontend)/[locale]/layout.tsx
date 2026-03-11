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
import { CookiePopup } from '@/components/Cookies/cookiePopup'
import { NewsletterPopup } from '@/components/NewsletterSignup/NewsletterPopup'
import Script from 'next/script'

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
        {/* Google Analytics tag (gtag.js) */}
        <Script
          id="google-gtag"
          strategy="afterInteractive"
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XR28GR07KB"
        ></Script>
        <Script
          id="google-tag-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XR28GR07KB');
          `,
          }}
        />
        {/* End Analytics Tag */}
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MQ9VGDQB');`,
          }}
        />
        {/* End Google Tag Manager */}
        <link href="/icon.ico" rel="icon" sizes="32x32" />
      </head>
      <body>
        {/* <!-- Google Tag Manager (noscript) --> */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MQ9VGDQB"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* <!-- End Google Tag Manager (noscript) --> */}
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <Header locale={locale} />
            {children}
            <Footer locale={locale} />
            <CookiePopup />
            <NewsletterPopup />
          </NextIntlClientProvider>
        </Providers>
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
