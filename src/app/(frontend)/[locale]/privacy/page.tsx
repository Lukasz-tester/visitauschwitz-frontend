import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/container'
import { generateSimplePageJsonLd } from '@/utilities/buildSchema'
import { routing } from '@/i18n/routing'
import type { Locale } from '@/i18n/localization'

type Props = {
  params: Promise<{ locale: Locale }>
}

const OG_IMAGE =
  'https://images.visitauschwitz.info/entering-gate-arbeit-macht-frei-auschwitz-hero.webp'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy.metadata' })

  const title = t('title')
  const description = t('description')

  const languages: Record<string, string> = {}
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/privacy`
  }
  languages['x-default'] = '/en/privacy'

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/privacy`,
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

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'privacy.metadata' })
  const jsonLd = generateSimplePageJsonLd({
    locale,
    path: 'privacy',
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
          <PrivacyContent />
        </Container>
      </main>
    </>
  )
}

function PrivacyContent() {
  const t = useTranslations('privacy')

  return (
    <article className="prose max-w-none">
      <h1 className="text-3xl md:text-4xl font-serif font-medium mb-8">{t('title')}</h1>
      <p className="text-muted mb-8">{t('lastUpdated')}</p>

      <section className="mb-10">
        <h2 className="mb-4">{t('intro.title')}</h2>
        <p>{t('intro.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('dataCollection.title')}</h2>
        <p>{t('dataCollection.intro')}</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>{t('dataCollection.item1')}</li>
          <li>{t('dataCollection.item2')}</li>
          <li>{t('dataCollection.item3')}</li>
          <li>{t('dataCollection.item4')}</li>
          <li>{t('dataCollection.item5')}</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('legalBasis.title')}</h2>
        <p>{t('legalBasis.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('dataUse.title')}</h2>
        <p>{t('dataUse.intro')}</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>{t('dataUse.item1')}</li>
          <li>{t('dataUse.item2')}</li>
          <li>{t('dataUse.item3')}</li>
          <li>{t('dataUse.item4')}</li>
          <li>{t('dataUse.item5')}</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('emailMarketing.title')}</h2>
        <p>{t('emailMarketing.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('cookies.title')}</h2>
        <p>{t('cookies.intro')}</p>

        <h3 className="mt-6 mb-3">{t('cookies.essential.title')}</h3>
        <p>{t('cookies.essential.content')}</p>

        <h3 className="mt-6 mb-3">{t('cookies.analytics.title')}</h3>
        <p>{t('cookies.analytics.content')}</p>

        <p className="mt-4">{t('cookies.control')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('dataRetention.title')}</h2>
        <p>{t('dataRetention.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('dataStorage.title')}</h2>
        <p>{t('dataStorage.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('thirdParty.title')}</h2>
        <p>{t('thirdParty.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('internationalTransfers.title')}</h2>
        <p>{t('internationalTransfers.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('thirdPartyData.title')}</h2>
        <p>{t('thirdPartyData.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('automatedDecisions.title')}</h2>
        <p>{t('automatedDecisions.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('minimumAge.title')}</h2>
        <p>{t('minimumAge.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('rights.title')}</h2>
        <p>{t('rights.intro')}</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li>{t('rights.item1')}</li>
          <li>{t('rights.item2')}</li>
          <li>{t('rights.item3')}</li>
          <li>{t('rights.item4')}</li>
          <li>{t('rights.item5')}</li>
          <li>{t('rights.item6')}</li>
          <li>{t('rights.item7')}</li>
          <li>{t('rights.item8')}</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('contact.title')}</h2>
        <p>{t('contact.content')}</p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4">{t('changes.title')}</h2>
        <p>{t('changes.content')}</p>
      </section>
    </article>
  )
}
