import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/container'
import { generateSimplePageJsonLd } from '@/utilities/buildSchema'
import { routing } from '@/i18n/routing'

type Props = {
  params: Promise<{ locale: string }>
}

const OG_IMAGE =
  'https://images.visitauschwitz.info/entering-gate-arbeit-macht-frei-auschwitz-hero.webp'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'terms.metadata' })

  const title = t('title')
  const description = t('description')

  const languages: Record<string, string> = {}
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/terms`
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/terms`,
      languages,
    },
    openGraph: {
      title,
      description,
      locale,
      type: 'website',
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'Arbeit Macht Frei gate at Auschwitz-Birkenau Memorial',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  }
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'terms.metadata' })
  const jsonLd = generateSimplePageJsonLd({
    locale,
    path: 'terms',
    name: t('title'),
    description: t('description'),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="py-16 md:py-24">
        <Container>
          <TermsContent />
        </Container>
      </main>
    </>
  )
}

function TermsContent() {
  const t = useTranslations('terms')

  return (
    <article className="prose max-w-none">
      <h1 className="text-3xl md:text-4xl font-serif font-medium mb-8">{t('title')}</h1>
      <p className="text-muted mb-8">{t('lastUpdated')}</p>

      <section className="mb-10">
        <h2 className="mb-4">{t('intro.title')}</h2>
        <p>{t('intro.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('eligibility.title')}</h2>
        <p>{t('eligibility.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('natureOfWebsite.title')}</h2>
        <p>{t('natureOfWebsite.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('intellectualProperty.title')}</h2>
        <p>{t('intellectualProperty.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('acceptableUse.title')}</h2>
        <p>{t('acceptableUse.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('userSubmissions.title')}</h2>
        <p>{t('userSubmissions.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('servicesAndSales.title')}</h2>
        <p>{t('servicesAndSales.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('consumerRights.title')}</h2>
        <p>{t('consumerRights.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('disclaimer.title')}</h2>
        <p>{t('disclaimer.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('externalLinks.title')}</h2>
        <p>{t('externalLinks.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('technicalAvailability.title')}</h2>
        <p>{t('technicalAvailability.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('modifications.title')}</h2>
        <p>{t('modifications.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('governingLaw.title')}</h2>
        <p>{t('governingLaw.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('contact.title')}</h2>
        <p>{t('contact.content')}</p>
      </section>
    </article>
  )
}
