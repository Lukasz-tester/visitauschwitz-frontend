import { getTranslations } from 'next-intl/server'
import { SearchContent } from './SearchContent'

import type { Metadata } from 'next'

type Args = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return {
    title: t('search'),
  }
}

export default async function SearchPage({ params }: Args) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-semibold mb-8 text-center">{t('search')}</h1>
      <SearchContent cmsUrl={process.env.CMS_PUBLIC_SERVER_URL!} />
    </div>
  )
}
