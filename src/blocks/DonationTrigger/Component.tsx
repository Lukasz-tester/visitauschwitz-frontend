'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { cn } from 'src/utilities/cn'
import { Copy, Check } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import RichText from '@/components/RichText'

const DONATION_IMAGE_URL = 'https://images.visitauschwitz.info/home-guide-birkenau-gate.webp'
const BLIK_NUMBER = '502983333'
const STRIPE_URL = 'https://donate.stripe.com/bJefZhe8d04jgclgDL0Fi01'
const PAYPAL_URL = 'https://www.paypal.com/donate/?hosted_button_id=WE3LXWNR3JLFY'
const EXTRA_LINK_HREF = '/support/'

type Column = {
  size?: 'oneHalf' | 'oneThird' | 'oneSixth' | null
  richText?: any
  enableMedia?: boolean | null
  mediaCaption?: string | null
  enableButtons?: boolean | null
  id?: string | null
}

type Props = {
  heading?: any
  columns?: Column[] | null
  changeBackground?: boolean | null
  addMarginTop?: boolean | null
  addMarginBottom?: boolean | null
  blockName?: string | null
}

function hasRichTextContent(rt: { root: { children?: Array<any> } } | null | undefined): boolean {
  const hasText = (node: any): boolean => {
    if (node?.text) return true
    return Array.isArray(node?.children) && node.children.some(hasText)
  }
  return Array.isArray(rt?.root?.children) && rt.root.children.some(hasText)
}

const baseButtonClass =
  'text-nowrap px-3 font-normal no-underline rounded-xl text-xl flex items-center justify-center w-full'

const neutralButtonClass =
  'opacity-80 py-0 leading-[2.7] dark:hover:bg-slate-700/80 hover:bg-slate-400/50 transition-colors'

const buttonClassFor = (primary?: boolean, changeBackground?: boolean) =>
  cn(
    baseButtonClass,
    primary
      ? 'btn-living mb-4'
      : cn(neutralButtonClass, changeBackground ? 'bg-background' : 'bg-card-foreground'),
  )

const BlikButton: React.FC<{ primary?: boolean; changeBackground?: boolean }> = ({
  primary,
  changeBackground,
}) => {
  const t = useTranslations()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BLIK_NUMBER)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={buttonClassFor(primary, changeBackground)}
      aria-label={t('donation-btn-blik')}
    >
      {copied ? (
        <Check className="w-5 h-5 text-green-500 mr-2" />
      ) : (
        <Copy className="w-5 h-5 mr-3" />
      )}
      <div className="flex flex-col items-start leading-tight">
        {t('donation-btn-blik')}
        <span className="text-sm opacity-80">{t('donation-btn-under-blik')}</span>
      </div>
    </button>
  )
}

const CardButton: React.FC<{ primary?: boolean; changeBackground?: boolean }> = ({
  primary,
  changeBackground,
}) => {
  const t = useTranslations()
  const locale = useLocale()
  return (
    <Link
      href={`${STRIPE_URL}?locale=${locale}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonClassFor(primary, changeBackground), !primary && 'py-3')}
    >
      <div
        className="flex flex-col items-center leading-tight
      "
      >
        {t('donation-btn-card')}
        <span className="text-sm opacity-80">{t('donation-btn-under-card')}</span>
      </div>
    </Link>
  )
}

const PayPalButton: React.FC<{ primary?: boolean; changeBackground?: boolean }> = ({
  primary,
  changeBackground,
}) => {
  const t = useTranslations()
  return (
    <Link
      href={PAYPAL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClassFor(primary, changeBackground)}
    >
      {t('donation-btn-paypal')}
    </Link>
  )
}

const DonationButtons: React.FC<{ locale: string; changeBackground?: boolean }> = ({
  locale,
  changeBackground,
}) => {
  const t = useTranslations()
  const order = locale === 'pl' ? (['blik', 'card'] as const) : (['card', 'paypal'] as const)
  return (
    <div className="flex flex-col gap-2">
      {order.map((kind, idx) => {
        const primary = idx === 0
        if (kind === 'blik')
          return <BlikButton key="blik" primary={primary} changeBackground={changeBackground} />
        if (kind === 'card')
          return <CardButton key="card" primary={primary} changeBackground={changeBackground} />
        return <PayPalButton key="paypal" primary={primary} changeBackground={changeBackground} />
      })}
      <Link
        href={`/${locale}${EXTRA_LINK_HREF}`}
        className="mt-2 text-center text-md opacity-70 hover:opacity-90 transition-opacity"
      >
        {t('donation-extra-link')}
      </Link>
    </div>
  )
}

const DonationTriggerInner: React.FC<Props> = ({
  heading,
  columns,
  changeBackground,
  addMarginTop,
  addMarginBottom,
  blockName,
}) => {
  const locale = useLocale()
  const hasHalfColumn = columns?.some((col) => col.size === 'oneHalf')

  return (
    <section
      id={blockName || undefined}
      className={cn({
        'bg-card-foreground': changeBackground,
        'pt-14': addMarginTop,
        'pb-14': addMarginBottom,
        // 'pt-24': !hasRichTextContent(heading) && columns && columns.length > 3,
      })}
    >
      <div className={hasHalfColumn ? undefined : 'container'}>
        {heading && (
          <RichText
            className={cn('md:px-[17.3%] ', {
              'pb-14': hasRichTextContent(heading) && columns && columns.length > 0,
              hidden: !hasRichTextContent(heading),
            })}
            content={heading}
            enableGutter={false}
          />
        )}

        <div
          className={cn(
            'grid grid-cols-4 lg:grid-cols-12 gap-6 md:gap-14',
            // changeBackground ? 'pb-14' : 'mb-14',
          )}
        >
          {columns?.map((col, index) => {
            const { enableMedia, mediaCaption, enableButtons, richText, size, id } = col
            // const colSpan = colsSpanClasses[size || 'oneThird'] || '4'
            const caption = mediaCaption

            return (
              <article
                id={id || undefined}
                key={id || index}
                className={cn('col-span-4', {
                  'md:col-span-2 lg:col-span-6 xl:col-span-4': size === 'oneThird',
                  'hidden lg:block lg:col-span-2': size === 'oneSixth',
                  'lg:col-span-6': size === 'oneHalf',
                })}
              >
                {enableMedia && (
                  <div className="relative w-full h-auto rounded overflow-hidden mb-4 max-sm:max-w-52 max-sm:mx-auto">
                    <div
                      className={`absolute inset-0 bg-gradient-to-b animate-pulse z-0 ${changeBackground ? 'from-card' : 'from-card-foreground'}`}
                    />
                    <div className="relative z-10">
                      <img
                        src={DONATION_IMAGE_URL}
                        alt="Auschwitz licensed guide in front of Birkenau gate."
                        className="rounded w-full h-auto max-sm:aspect-square max-sm:object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="relative z-10 mt-4 text-md opacity-80">{caption}</p>
                  </div>
                )}

                {richText && (
                  <RichText
                    className={cn('mb-6', {
                      'prose-a:bg-card': changeBackground,
                      hidden: !hasRichTextContent(richText),
                    })}
                    content={richText}
                    enableGutter={false}
                    styleLink={true}
                  />
                )}

                {enableButtons && (
                  <DonationButtons locale={locale} changeBackground={!!changeBackground} />
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const DonationTriggerBlock = React.memo(DonationTriggerInner)
