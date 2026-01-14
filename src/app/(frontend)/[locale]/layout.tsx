import './globals.css'
import type { Metadata } from 'next'

// export const revalidate = 600
export const revalidate = false
export const dynamic = 'force-static'

// import { cn } from 'src/utilities/cn'
import React from 'react'

import { Footer } from '@/globals/Footer/Component'
import { Header } from '@/globals/Header/Component'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { TypedLocale } from 'payload'

import { getMessages, setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { CookiePopup } from '@/components/Cookies/cookiePopup'

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
        {/* Google Analytics tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XR28GR07KB"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XR28GR07KB');
          `,
          }}
        />
        {/* <!-- End Analytics Tag --> */}
        {/* <!-- Google Tag Manager --> */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-MQ9VGDQB');`,
          }}
        />
        {/* <!-- End Google Tag Manager --> */}
        <InitTheme />
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
            <LivePreviewListener />
            <Header locale={locale} />
            {children}
            <Footer locale={locale} />
            <CookiePopup />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  icons: {
    // icon: [
    //   { url: '/favicon.ico' }, // default fallback
    //   { url: '/favicon.png' },
    //   { url: '/icon.ico', sizes: '32x32', type: 'image/png' },
    // ],
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
