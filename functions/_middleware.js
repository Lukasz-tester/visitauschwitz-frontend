import localization, { locales as LOCALES } from '../src/i18n/localization'

const DEFAULT_LOCALE = localization.defaultLocale

// Countries where Polish should be the default
const PL_COUNTRIES = ['PL']

function getPreferredLocale(request) {
  // 1. Check country via CF header
  const country = request.cf?.country
  if (country && PL_COUNTRIES.includes(country)) return 'pl'

  // 2. Check Accept-Language header
  const acceptLang = request.headers.get('Accept-Language')
  if (acceptLang) {
    // Parse "pl,en-US;q=0.9,en;q=0.8" into sorted locale list
    const langs = acceptLang
      .split(',')
      .map((part) => {
        const [lang, q] = part.trim().split(';q=')
        return { lang: lang.split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1 }
      })
      .sort((a, b) => b.q - a.q)

    for (const { lang } of langs) {
      if (LOCALES.includes(lang)) return lang
    }
  }

  return DEFAULT_LOCALE
}

export async function onRequest(context) {
  const { request, next } = context
  const url = new URL(request.url)
  const { pathname } = url

  // Skip static files, API routes, and already-prefixed paths
  const hasLocalePrefix = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  )
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    hasLocalePrefix ||
    pathname === '/sitemap.xml' ||
    pathname === '/sitemap-v2.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/icon.ico' ||
    pathname === '/apple-touch-icon.png' ||
    /\.\w{2,5}$/.test(pathname) // skip files with extensions (.js, .css, .png, etc.)
  ) {
    return next()
  }

  const locale = getPreferredLocale(request)

  // Redirect / or /tour or /faq etc. to /{locale}/...
  const newPath = pathname === '/' ? `/${locale}/` : `/${locale}${pathname}`
  url.pathname = newPath

  return Response.redirect(url.toString(), 302)
}
