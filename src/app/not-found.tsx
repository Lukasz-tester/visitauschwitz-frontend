'use client'

import { useEffect, useState } from 'react'
import de from '@/i18n/messages/de.json'
import en from '@/i18n/messages/en.json'
import es from '@/i18n/messages/es.json'
import fr from '@/i18n/messages/fr.json'
import it from '@/i18n/messages/it.json'
import nl from '@/i18n/messages/nl.json'
import pl from '@/i18n/messages/pl.json'
import ru from '@/i18n/messages/ru.json'
import uk from '@/i18n/messages/uk.json'

const allMessages = { de, en, es, fr, it, nl, pl, ru, uk }
const messages = Object.fromEntries(
  Object.entries(allMessages).map(([code, m]) => [
    code,
    { title: m['page-not-found'], home: m['go-home'] },
  ]),
) as Record<string, { title: string; home: string }>

const themeScript = `(function(){var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)})()`

const themeStyles = `
:root { --nf-bg: #faf8f5; --nf-fg: #1a1a2e; --nf-muted: #64748b; --nf-btn-bg: #1a1a2e; --nf-btn-fg: #fff; }
[data-theme='dark'] { --nf-bg: #110e0e; --nf-fg: #f1f5f9; --nf-muted: #94a3b8; --nf-btn-bg: #f1f5f9; --nf-btn-fg: #110e0e; }
`

export default function GlobalNotFound() {
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    const seg = window.location.pathname.split('/')[1] || ''
    if (seg in messages) setLocale(seg)
  }, [])

  const t = messages[locale]

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>404 – Visit Auschwitz</title>
        <link href="/icon.ico" rel="icon" sizes="32x32" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: 'var(--nf-bg)',
          color: 'var(--nf-fg)',
          textAlign: 'center',
          transition: 'background-color 0.2s, color 0.2s',
        }}
      >
        <div>
          <h1 style={{ fontSize: '8rem', margin: 0, opacity: 0.1, lineHeight: 1 }}>404</h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--nf-muted)', marginTop: '0.5rem' }}>
            {t.title}
          </p>
          <a
            href={`/${locale}/`}
            style={{
              display: 'inline-block',
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--nf-btn-bg)',
              color: 'var(--nf-btn-fg)',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {t.home}
          </a>
        </div>
      </body>
    </html>
  )
}
