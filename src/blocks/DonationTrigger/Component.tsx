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
const EXTRA_LINK_HREF = '/support/#support-options'

type Column = {
  size?: 'oneThird' | 'oneSixth' | null
  richText?: any
  enableMedia?: boolean | null
  enableButtons?: boolean | null
  id?: string | null
}

type Props = {
  heading?: any
  columns?: Column[] | null
  changeBackground?: boolean | null
  blockName?: string | null
}

function hasRichTextContent(rt: { root: { children?: Array<any> } } | null | undefined): boolean {
  const hasText = (node: any): boolean => {
    if (node?.text) return true
    return Array.isArray(node?.children) && node.children.some(hasText)
  }
  return Array.isArray(rt?.root?.children) && rt.root.children.some(hasText)
}

const buttonClass =
  'bg-card-foreground text-nowrap px-3 py-0 font-normal no-underline rounded-xl text-xl leading-[2.6] border border-slate-500/40 dark:hover:bg-slate-700/80 hover:bg-slate-400/50 transition-colors flex items-center justify-center gap-2 w-full'

const BlikButton: React.FC = () => {
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
    <button onClick={handleCopy} className={buttonClass} aria-label={t('donation-btn-blik')}>
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      {t('donation-btn-blik')}
    </button>
  )
}

const CardButton: React.FC = () => {
  const t = useTranslations()
  const locale = useLocale()
  return (
    <a
      href={`${STRIPE_URL}?locale=${locale}`}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass}
    >
      {t('donation-btn-card')}
    </a>
  )
}

const PayPalButton: React.FC = () => {
  const t = useTranslations()
  return (
    <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer" className={buttonClass}>
      {t('donation-btn-paypal')}
    </a>
  )
}

const DonationButtons: React.FC<{ locale: string }> = ({ locale }) => {
  const t = useTranslations()
  const order = locale === 'pl' ? (['blik', 'card'] as const) : (['card', 'paypal'] as const)
  return (
    <div className="flex flex-col gap-2 mt-4">
      {order.map((kind) => {
        if (kind === 'blik') return <BlikButton key="blik" />
        if (kind === 'card') return <CardButton key="card" />
        return <PayPalButton key="paypal" />
      })}
      <Link
        href={`/${locale}${EXTRA_LINK_HREF}`}
        className="mt-2 text-center text-sm opacity-70 hover:opacity-100 transition-opacity"
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
  blockName,
}) => {
  const t = useTranslations()
  const locale = useLocale()

  const colsSpanClasses: Record<string, string> = {
    oneThird: '4',
    oneSixth: '2',
  }

  return (
    <section
      id={blockName || undefined}
      className={cn('pt-14', {
        'bg-card-foreground': changeBackground,
        'pt-24': !hasRichTextContent(heading) && columns && columns.length > 3,
      })}
    >
      <div className="container">
        {heading && (
          <RichText
            className={cn('md:px-[17.3%] pt-10', {
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
            changeBackground ? 'pb-14' : 'mb-14',
          )}
        >
          {columns?.map((col, index) => {
            const { enableMedia, enableButtons, richText, size, id } = col
            const colSpan = colsSpanClasses[size || 'oneThird'] || '4'

            return (
              <article
                id={id || undefined}
                key={id || index}
                className={cn(`col-span-4 lg:col-span-${colSpan}`, {
                  'md:col-span-2': size !== 'oneThird',
                  'col-span-4 md:col-span-2 lg:col-span-6 xl:col-span-4': size === 'oneThird',
                  'hidden lg:block': size === 'oneSixth',
                })}
              >
                {enableMedia && (
                  <div className="relative w-full h-auto rounded overflow-hidden mb-4">
                    <div
                      className={`absolute inset-0 bg-gradient-to-b animate-pulse z-0 ${changeBackground ? 'from-card' : 'from-card-foreground'}`}
                    />
                    <div className="relative z-10">
                      <img
                        src={DONATION_IMAGE_URL}
                        alt={t('donation-image-caption')}
                        className="rounded w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                    <p className="relative z-10 mt-2 text-sm opacity-80">
                      {t('donation-image-caption')}
                    </p>
                  </div>
                )}

                {richText && (
                  <RichText
                    className={cn({
                      'prose-a:bg-card': changeBackground,
                      hidden: !hasRichTextContent(richText),
                    })}
                    content={richText}
                    enableGutter={false}
                    styleLink={true}
                  />
                )}

                {enableButtons && <DonationButtons locale={locale} />}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const DonationTriggerBlock = React.memo(DonationTriggerInner)
