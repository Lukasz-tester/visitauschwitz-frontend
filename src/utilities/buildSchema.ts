import type { Page, Post } from '@/payload-types'
import type { Locale } from '@/i18n/localization'
import { removeSpecialChars, richTextToHtml } from '@/utilities/helpersSsr'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.visitauschwitz.info'
const R2_BASE = process.env.NEXT_PUBLIC_CF_R2_URL || 'https://images.visitauschwitz.info'

/* ─────────────────────────────────────────────────────────────
   SHARED STATIC ENTITIES (SITE-WIDE KNOWLEDGE GRAPH CORE)
───────────────────────────────────────────────────────────── */

// Organization (Publisher) — NEW (fixes major SEO issue)
const organizationNode = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Visit Auschwitz',
  url: SITE_URL,
  founder: { '@id': `${SITE_URL}/#author` },
}

// Website
const websiteNode = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Visit Auschwitz',
  publisher: { '@id': `${SITE_URL}/#organization` },
}

// Author (E-E-A-T strengthened)
const authorNode = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#author`,
  name: 'Łukasz',
  jobTitle: 'Licensed Auschwitz Guide',
  description:
    'Licensed guide at Auschwitz-Birkenau State Museum since 2006. Specialist in Holocaust education, Auschwitz history, and visitor guidance.',
  url: SITE_URL,
  worksFor: { '@id': `${SITE_URL}/#museum` },
  knowsAbout: [
    'Auschwitz history',
    'Holocaust education',
    'Nazi concentration camps',
    'Dark tourism',
  ],
  sameAs: [
    `${SITE_URL}/en/#about-me`,
    `${SITE_URL}/pl/#about-me`,
    'https://pl.linkedin.com/in/%C5%82ukasz-tarnowski-1135b8124',
  ],
}

// Core Place Entity (Museum)
const museumNode = {
  '@type': ['Museum', 'TouristAttraction'],
  '@id': `${SITE_URL}/#museum`,
  name: 'Auschwitz-Birkenau State Museum',
  description:
    'Memorial and museum located at the site of the former German Nazi concentration and extermination camp Auschwitz. UNESCO World Heritage Site.',
  url: 'https://www.auschwitz.org/en/',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Więźniów Oświęcimia 55',
    addressLocality: 'Oświęcim',
    postalCode: '32-600',
    addressCountry: 'PL',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 50.027,
    longitude: 19.203,
  },
  sameAs: [
    'https://www.auschwitz.org/',
    'https://en.wikipedia.org/wiki/Auschwitz-Birkenau_State_Museum',
    'https://whc.unesco.org/en/list/31',
  ],
}

// Guide Service (LocalBusiness / TravelAgency)
const guideServiceNode = {
  '@type': ['TravelAgency', 'LocalBusiness'],
  '@id': `${SITE_URL}/#guideservice`,
  name: 'Visit Auschwitz – Licensed Guide Service',
  description:
    'Licensed guide service for Auschwitz-Birkenau Memorial and Museum. Personalized tours led by an educator with nearly 20 years of experience.',
  url: SITE_URL,
  founder: { '@id': `${SITE_URL}/#author` },
  employee: { '@id': `${SITE_URL}/#author` },
  parentOrganization: { '@id': `${SITE_URL}/#organization` },
  areaServed: {
    '@type': 'City',
    name: 'Oświęcim',
    sameAs: 'https://en.wikipedia.org/wiki/O%C5%9Bwi%C4%99cim',
  },
  serviceType: 'Guided tours',
}

/* ─────────────────────────────────────────────────────────────
   DYNAMIC BUILDERS
───────────────────────────────────────────────────────────── */

type BreadcrumbItem = { name: string; url: string }

function buildImageNode(imageUrl: string, pageUrl: string) {
  return {
    '@type': 'ImageObject',
    '@id': `${pageUrl}#primaryimage`,
    url: imageUrl,
    inLanguage: 'en',
  }
}

function buildWebPageNode({
  url,
  name,
  description,
  locale,
  datePublished,
  dateModified,
  image,
  faqId,
}: {
  url: string
  name: string
  description?: string | null
  locale: Locale
  datePublished?: string | null
  dateModified?: string | null
  image?: string
  faqId?: string
}) {
  return {
    '@type': ['WebPage'],
    '@id': `${url}#webpage`,
    url,
    name,
    ...(description ? { description } : {}),
    inLanguage: locale,
    ...(datePublished ? { datePublished: datePublished.slice(0, 10) } : {}),
    ...(dateModified ? { dateModified: dateModified.slice(0, 10) } : {}),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#museum` },
    mainEntity: { '@id': `${SITE_URL}/#museum` },
    author: { '@id': `${SITE_URL}/#author` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    ...(image ? { primaryImageOfPage: { '@id': `${url}#primaryimage` } } : {}),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: faqId
        ? ['h1', 'h2', 'article > button h3', '[role="region"]']
        : ['h1', 'h2'],
    },
    ...(faqId ? { hasPart: { '@id': faqId } } : {}),
  }
}

function buildArticleNode({
  post,
  locale,
  slug,
  faqId,
}: {
  post: Post
  locale: Locale
  slug: string
  faqId?: string
}) {
  const url = `${SITE_URL}/${locale}/posts/${slug}`

  const metaImage = post.meta?.image
  let image: string | undefined

  if (metaImage && typeof metaImage === 'object') {
    if ('filename' in metaImage && typeof metaImage.filename === 'string') {
      const webpFilename = metaImage.filename.endsWith('.webp')
        ? metaImage.filename
        : metaImage.filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      image = `${R2_BASE}/${webpFilename}`
    } else if ('url' in metaImage && typeof metaImage.url === 'string') {
      image = metaImage.url.startsWith('http') ? metaImage.url : `${SITE_URL}${metaImage.url}`
    }
  }

  return {
    '@type': ['Article', 'WebPage'],
    '@id': `${url}#article`,
    url,
    headline: post.title,
    ...(post.meta?.description ? { description: post.meta.description } : {}),
    ...(image ? { image: { '@id': `${url}#primaryimage` } } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt.slice(0, 10) } : {}),
    ...((post as any).updatedAt ? { dateModified: (post as any).updatedAt.slice(0, 10) } : {}),
    inLanguage: locale,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#museum` },
    mainEntity: { '@id': `${SITE_URL}/#museum` },
    author: { '@id': `${SITE_URL}/#author` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    ...(faqId ? { hasPart: { '@id': faqId } } : {}),
  }
}

function buildBreadcrumbNode(pageUrl: string, items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

function buildFAQNode(
  items: { name: string; text: string }[],
  pageUrl: string,
  locale: Locale = 'en',
) {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    inLanguage: locale,
    mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.text,
      },
    })),
  }
}

export type SchemaNavItem = {
  link: {
    type?: ('reference' | 'custom') | null
    reference?: { relationTo: string; value: string | { slug?: string } } | null
    url?: string | null
    label: string
  }
}

function buildSiteNavigationNode(navItems: SchemaNavItem[], locale: Locale) {
  return {
    '@type': 'SiteNavigationElement',
    '@id': `${SITE_URL}/${locale}#sitenav`,
    name: 'Main Navigation',
    hasPart: navItems.map((item) => {
      let url: string
      if (item.link.type === 'reference' && item.link.reference) {
        const ref = item.link.reference.value
        const slug = typeof ref === 'string' ? ref : ref?.slug || ''
        url = `${SITE_URL}/${locale}/${slug}`
      } else {
        url = item.link.url?.startsWith('http')
          ? item.link.url
          : `${SITE_URL}${item.link.url || ''}`
      }
      return {
        '@type': 'SiteNavigationElement',
        name: item.link.label,
        url,
      }
    }),
  }
}

export function extractFAQItems(
  blocks: Page['layout'] | undefined,
): { name: string; text: string }[] {
  if (!blocks) return []
  return blocks
    .filter((block) => block.blockType === 'accordion' && (block as any).isFAQ)
    .flatMap(
      (block) =>
        (block as any).accordionItems?.map((item: any) => ({
          name: removeSpecialChars(item.question ?? 'Untitled Question'),
          text: richTextToHtml(item.answer),
        })) ?? [],
    )
}

/* ─────────────────────────────────────────────────────────────
   TRAVEL-SPECIFIC BUILDERS
───────────────────────────────────────────────────────────── */

function buildTouristTripNode(url: string, locale: Locale) {
  const isPolish = locale === 'pl'
  return {
    '@type': 'TouristTrip',
    '@id': `${url}#touristtrip`,
    name: isPolish ? 'Zwiedzanie Auschwitz-Birkenau' : 'Auschwitz-Birkenau Memorial Tour',
    description: isPolish
      ? 'Trasa zwiedzania po byłym niemieckim nazistowskim obozie koncentracyjnym i zagłady Auschwitz I oraz Auschwitz II-Birkenau.'
      : 'Tour of the former German Nazi concentration and extermination camp Auschwitz I and Auschwitz II-Birkenau.',
    touristType: ['Cultural tourism', 'Heritage tourism'],
    inLanguage: locale,
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: 2,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'TouristAttraction',
            name: 'Auschwitz I – Main Camp',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Więźniów Oświęcimia 20',
              addressLocality: 'Oświęcim',
              postalCode: '32-600',
              addressCountry: 'PL',
            },
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'TouristAttraction',
            name: 'Auschwitz II – Birkenau',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Ofiar Faszyzmu 12',
              addressLocality: 'Brzezinka',
              postalCode: '32-600',
              addressCountry: 'PL',
            },
          },
        },
      ],
    },
    provider: { '@id': `${SITE_URL}/#museum` },
    subjectOf: { '@id': `${url}#webpage` },
  }
}

function buildEventNode(url: string, locale: Locale) {
  const isPolish = locale === 'pl'
  const today = new Date()
  const startDate = today.toISOString().slice(0, 10)
  const endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    .toISOString()
    .slice(0, 10)
  return {
    '@type': 'Event',
    '@id': `${url}#event`,
    name: isPolish
      ? 'Zwiedzanie Auschwitz-Birkenau z przewodnikiem'
      : 'Guided Tour of Auschwitz-Birkenau',
    description: isPolish
      ? 'Zwiedzanie z licencjonowanym przewodnikiem po Miejscu Pamięci i Muzeum Auschwitz-Birkenau. Dostępne codziennie.'
      : 'Guided tour with a licensed educator at the Auschwitz-Birkenau Memorial and Museum. Available daily.',
    startDate,
    inLanguage: locale,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@id': `${SITE_URL}/#museum` },
    organizer: { '@id': `${SITE_URL}/#museum` },
    performer: { '@id': `${SITE_URL}/#museum` },
    eventSchedule: {
      '@type': 'Schedule',
      startDate,
      endDate,
      repeatFrequency: 'P1D',
      byDay: [
        'https://schema.org/Monday',
        'https://schema.org/Tuesday',
        'https://schema.org/Wednesday',
        'https://schema.org/Thursday',
        'https://schema.org/Friday',
        'https://schema.org/Saturday',
        'https://schema.org/Sunday',
      ],
    },
    offers: [
      {
        '@type': 'Offer',
        name: isPolish ? 'Zwiedzanie z przewodnikiem' : 'Guided tour',
        price: '130',
        priceCurrency: 'PLN',
        availability: 'https://schema.org/InStock',
        url: 'https://visit.auschwitz.org',
        validFrom: '2026-01-01',
      },
    ],
  }
}

function buildHowToNode(url: string, locale: Locale) {
  const isPolish = locale === 'pl'
  return {
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name: isPolish ? 'Jak zarezerwować bilety do Auschwitz' : 'How to Book Auschwitz Tickets',
    description: isPolish
      ? 'Przewodnik krok po kroku jak zarezerwować bilety do Muzeum Auschwitz-Birkenau.'
      : 'Step-by-step guide to booking tickets for the Auschwitz-Birkenau Memorial and Museum.',
    inLanguage: locale,
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: isPolish ? 'Wybierz rodzaj zwiedzania' : 'Choose your tour type',
        text: isPolish
          ? 'Zdecyduj, czy chcesz zwiedzać samodzielnie (bezpłatnie) czy z przewodnikiem (130–170 PLN).'
          : 'Decide between a self-guided visit (free) or a guided tour (130–170 PLN).',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: isPolish ? 'Wejdź na stronę rezerwacji' : 'Visit the booking website',
        text: isPolish
          ? 'Przejdź na visit.auschwitz.org i wybierz datę wizyty.'
          : 'Go to visit.auschwitz.org and select your visit date.',
        url: 'https://visit.auschwitz.org',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: isPolish ? 'Wybierz godzinę wejścia' : 'Select your entry time',
        text: isPolish
          ? 'Wybierz dostępny slot czasowy. Rezerwuj z wyprzedzeniem — popularne terminy szybko się wyprzedają.'
          : 'Pick an available time slot. Book in advance — popular dates sell out quickly.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: isPolish ? 'Wypełnij dane i zapłać' : 'Complete your details and pay',
        text: isPolish
          ? 'Podaj dane osobowe, dokonaj płatności i pobierz potwierdzenie rezerwacji.'
          : 'Enter your personal details, complete the payment, and download your booking confirmation.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: isPolish ? 'Przyjdź na miejsce z potwierdzeniem' : 'Arrive with your confirmation',
        text: isPolish
          ? 'Przyjdź do muzeum z wydrukiem lub wersją elektroniczną potwierdzenia. Zabierz dokument tożsamości.'
          : 'Arrive at the museum with your printed or digital confirmation. Bring a valid ID.',
      },
    ],
  }
}

/* ─────────────────────────────────────────────────────────────
   GRAPH ASSEMBLERS
───────────────────────────────────────────────────────────── */

export function buildPageGraph({
  page,
  locale,
  url,
  breadcrumbItems,
  navItems,
}: {
  page: Page
  locale: Locale
  url: string
  breadcrumbItems: BreadcrumbItem[]
  navItems?: SchemaNavItem[]
}) {
  const faqItems = extractFAQItems(page.layout)
  const faqId = faqItems.length > 0 ? `${url}#faq` : undefined

  const metaImage = page.meta?.image
  let pageImage: string | undefined

  if (metaImage && typeof metaImage === 'object') {
    if ('filename' in metaImage && typeof metaImage.filename === 'string') {
      const webpFilename = metaImage.filename.endsWith('.webp')
        ? metaImage.filename
        : metaImage.filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      pageImage = `${R2_BASE}${webpFilename}`
    } else if ('url' in metaImage && typeof metaImage.url === 'string') {
      pageImage = metaImage.url.startsWith('http') ? metaImage.url : `${SITE_URL}${metaImage.url}`
    }
  }

  const nodes: object[] = [
    organizationNode,
    websiteNode,
    authorNode,
    museumNode,
    guideServiceNode,
    buildWebPageNode({
      url,
      name: page.meta?.title || page.title,
      description: page.meta?.description,
      locale,
      datePublished: (page as any).createdAt,
      dateModified: (page as any).updatedAt,
      image: pageImage,
      faqId,
    }),
    buildBreadcrumbNode(url, breadcrumbItems),
  ]

  if (pageImage) nodes.push(buildImageNode(pageImage, url))
  if (faqItems.length > 0) nodes.push(buildFAQNode(faqItems, url, locale))
  if (navItems?.length) nodes.push(buildSiteNavigationNode(navItems, locale))

  const slug = page.slug
  if (slug === 'tour') nodes.push(buildTouristTripNode(url, locale))
  if (slug === 'tickets') {
    nodes.push(buildEventNode(url, locale))
    nodes.push(buildHowToNode(url, locale))
  }

  return { '@context': 'https://schema.org', '@graph': nodes }
}

export function buildPostGraph({
  post,
  locale,
  slug,
  breadcrumbItems,
  navItems,
}: {
  post: Post
  locale: Locale
  slug: string
  breadcrumbItems: BreadcrumbItem[]
  navItems?: SchemaNavItem[]
}) {
  const url = `${SITE_URL}/${locale}/posts/${slug}`
  const faqItems = extractFAQItems((post as any).layout)
  const faqId = faqItems.length > 0 ? `${url}#faq` : undefined

  const nodes: object[] = [
    organizationNode,
    websiteNode,
    authorNode,
    museumNode,
    guideServiceNode,
    buildArticleNode({ post, locale, slug, faqId }),
    buildBreadcrumbNode(url, breadcrumbItems),
  ]

  if (faqItems.length > 0) nodes.push(buildFAQNode(faqItems, url, locale))
  if (navItems?.length) nodes.push(buildSiteNavigationNode(navItems, locale))

  return { '@context': 'https://schema.org', '@graph': nodes }
}

export function generateSimplePageJsonLd({
  locale,
  path,
  name,
  description,
}: {
  locale: Locale
  path: string
  name: string
  description: string
}) {
  const pageUrl = `${SITE_URL}/${locale}/${path}`
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Home', url: `${SITE_URL}/${locale}` },
    { name, url: pageUrl },
  ]

  const nodes: object[] = [
    organizationNode,
    websiteNode,
    buildWebPageNode({ url: pageUrl, name, description, locale }),
    buildBreadcrumbNode(pageUrl, breadcrumbItems),
  ]

  return { '@context': 'https://schema.org', '@graph': nodes }
}
