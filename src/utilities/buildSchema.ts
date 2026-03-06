
import type { Page, Post } from '@/payload-types'
import { extractTextFromRichText, removeSpecialChars } from '@/utilities/helpersSsr'

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
  locale: string
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
      cssSelector: ['h1', 'h2'],
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
  locale: string
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
      image = metaImage.url.startsWith('http')
        ? metaImage.url
        : `${SITE_URL}${metaImage.url}`
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
    ...((post as any).updatedAt
      ? { dateModified: (post as any).updatedAt.slice(0, 10) }
      : {}),
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

function buildFAQNode(items: { name: string; text: string }[], pageUrl: string, locale: string = 'en') {
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
          text: removeSpecialChars(extractTextFromRichText(item.answer)),
        })) ?? [],
    )
}

/* ─────────────────────────────────────────────────────────────
   GRAPH ASSEMBLERS
───────────────────────────────────────────────────────────── */

export function buildPageGraph({
  page,
  locale,
  url,
  breadcrumbItems,
}: {
  page: Page
  locale: string
  url: string
  breadcrumbItems: BreadcrumbItem[]
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
      pageImage = metaImage.url.startsWith('http')
        ? metaImage.url
        : `${SITE_URL}${metaImage.url}`
    }
  }

  const nodes: object[] = [
    organizationNode,
    websiteNode,
    authorNode,
    museumNode,
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

  return { '@context': 'https://schema.org', '@graph': nodes }
}

export function buildPostGraph({
  post,
  locale,
  slug,
  breadcrumbItems,
}: {
  post: Post
  locale: string
  slug: string
  breadcrumbItems: BreadcrumbItem[]
}) {
  const url = `${SITE_URL}/${locale}/posts/${slug}`
  const faqItems = extractFAQItems((post as any).layout)
  const faqId = faqItems.length > 0 ? `${url}#faq` : undefined

  const nodes: object[] = [
    organizationNode,
    websiteNode,
    authorNode,
    museumNode,
    buildArticleNode({ post, locale, slug, faqId }),
    buildBreadcrumbNode(url, breadcrumbItems),
  ]

  if (faqItems.length > 0) nodes.push(buildFAQNode(faqItems, url, locale))

  return { '@context': 'https://schema.org', '@graph': nodes }
}