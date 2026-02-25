import type { Page, Post } from '@/payload-types'
import { extractTextFromRichText, removeSpecialChars } from '@/utilities/helpersSsr'

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.visitauschwitz.info'
const R2_BASE = process.env.NEXT_PUBLIC_CF_R2_URL || 'https://images.visitauschwitz.info'

// ─── Shared static nodes ─────────────────────────────────────────────────────

const websiteNode = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Visit Auschwitz',
  publisher: { '@id': `${SITE_URL}/#author` },
}

const museumNode = {
  '@type': 'Museum',
  additionalType: 'https://schema.org/TouristAttraction',
  '@id': `${SITE_URL}/#museum`,
  name: 'Auschwitz-Birkenau State Museum',
  description:
    'Memorial and museum on the site of the former Nazi concentration and extermination camp. UNESCO World Heritage Site visited by nearly 2 million people every year.',
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
  image: {
    '@type': 'ImageObject',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Arbeit_macht_frei_sign,_Auschwitz_I.jpg/1280px-Arbeit_macht_frei_sign,_Auschwitz_I.jpg',
  },
  sameAs: [
    'https://www.auschwitz.org/',
    'https://en.wikipedia.org/wiki/Auschwitz-Birkenau_State_Museum',
  ],
}

const authorNode = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#author`,
  name: 'Łukasz',
  jobTitle: 'Licensed Auschwitz Guide',
  description:
    'Experienced licensed guide at Auschwitz-Birkenau since 2006 and author of this visitor guide.',
  url: `${SITE_URL}`,
  sameAs: [
    `${SITE_URL}/en/about`,
    `${SITE_URL}/pl/about`,
    'https://pl.linkedin.com/in/%C5%82ukasz-tarnowski-1135b8124',
  ],
}

// ─── Dynamic node builders ───────────────────────────────────────────────────

type BreadcrumbItem = { name: string; url: string }

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
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    ...(description ? { description } : {}),
    inLanguage: locale,
    ...(datePublished ? { datePublished: datePublished.slice(0, 10) } : {}),
    ...(dateModified ? { dateModified: dateModified.slice(0, 10) } : {}),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#museum` },
    author: { '@id': `${SITE_URL}/#author` },
    publisher: { '@id': `${SITE_URL}/#author` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: image } } : {}),
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', 'h2'] },
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

function buildFAQNode(items: { name: string; text: string }[], pageUrl: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
    },
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.name,
      acceptedAnswer: { '@type': 'Answer', text: item.text },
    })),
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

  const url = `${SITE_URL}/${locale}/posts/${slug}`

  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    url,
    headline: post.title,
    ...(post.meta?.description ? { description: post.meta.description } : {}),
    ...(image ? { image } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...((post as any).updatedAt ? { dateModified: (post as any).updatedAt.slice(0, 10) } : {}),
    inLanguage: locale,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#museum` },
    author: post.populatedAuthors?.length
      ? post.populatedAuthors.map((a: any) => ({ '@type': 'Person', name: a.name }))
      : { '@id': `${SITE_URL}/#author` },
    publisher: { '@id': `${SITE_URL}/#author` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    ...(faqId ? { hasPart: { '@id': faqId } } : {}),
  }
}

// ─── FAQ extractor ────────────────────────────────────────────────────────────

export function extractFAQItems(
  blocks: Page['layout'] | undefined,
): { name: string; text: string }[] {
  if (!blocks) return []
  return blocks
    .filter((block) => block.blockType === 'accordion' && (block as any).isFAQ)
    .flatMap(
      (block) =>
        (block as any).accordionItems?.map((item: any) => ({
          name: item.question ?? 'Untitled Question',
          text: removeSpecialChars(extractTextFromRichText(item.answer)),
        })) ?? [],
    )
}

// ─── Full graph assemblers ────────────────────────────────────────────────────

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
  const title = page.meta?.title ? `${page.meta.title} | ${new Date().getFullYear()}` : page.title

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
    websiteNode,
    buildWebPageNode({
      url,
      name: title,
      description: page.meta?.description,
      locale,
      datePublished: (page as any).createdAt,
      dateModified: (page as any).updatedAt,
      image: pageImage,
      faqId,
    }),
    museumNode,
    buildBreadcrumbNode(url, breadcrumbItems),
    authorNode,
  ]

  if (faqItems.length > 0) nodes.push(buildFAQNode(faqItems, url))

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
    websiteNode,
    buildArticleNode({ post, locale, slug, faqId }),
    museumNode,
    buildBreadcrumbNode(url, breadcrumbItems),
    authorNode,
  ]

  if (faqItems.length > 0) nodes.push(buildFAQNode(faqItems, url))

  return { '@context': 'https://schema.org', '@graph': nodes }
}
