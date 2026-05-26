'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from 'src/utilities/cn'
import RichText from '@/components/RichText'
import Link from 'next/link'

type Currency = 'PLN' | 'EUR' | 'USD' | 'GBP'

const CURRENCIES: Currency[] = ['PLN', 'EUR', 'USD', 'GBP']

const SYMBOLS: Record<Currency, string> = {
  PLN: 'zł',
  EUR: '€',
  USD: '$',
  GBP: '£',
}

type Row = {
  label?: string | null
  sublabel?: string | null
  pricePLN?: number | null
  pricePLNDiscount?: number | null
  priceMaxPLN?: number | null
  unit?: string | null
  pricesPLN?: { value: number; id?: string | null }[] | null
  id?: string | null
}

type Section = {
  title?: string | null
  intro?: any
  rowLabelHeader?: string | null
  columnHeaders?: { header: string; id?: string | null }[] | null
  rows?: Row[] | null
  footnote?: any
  id?: string | null
}

type Props = {
  heading?: any
  sections?: Section[] | null
  warning?: any
  changeBackground?: boolean | null
  addMarginTop?: boolean | null
  addMarginBottom?: boolean | null
  blockName?: string | null
  rates: { EUR: number; USD: number; GBP: number }
  updatedAt: string | null
  source: string
}

function hasRichTextContent(rt: { root?: { children?: Array<any> } } | null | undefined): boolean {
  const hasText = (node: any): boolean => {
    if (node?.text) return true
    return Array.isArray(node?.children) && node.children.some(hasText)
  }
  return Array.isArray(rt?.root?.children) && rt!.root!.children!.some(hasText)
}

function convert(pricePLN: number, currency: Currency, rates: Props['rates']): number {
  if (currency === 'PLN') return pricePLN
  return pricePLN * rates[currency]
}

function formatPrice(value: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(Math.round(value))
  } catch {
    return String(Math.round(value))
  }
}

export const TicketPricesClient: React.FC<Props> = ({
  heading,
  sections,
  warning,
  changeBackground,
  addMarginTop,
  addMarginBottom,
  blockName,
  rates,
  updatedAt,
  source,
}) => {
  const locale = useLocale()
  const t = useTranslations()
  const [currency, setCurrency] = useState<Currency>('PLN')
  const [liveRates, setLiveRates] = useState(rates)
  const [liveUpdatedAt, setLiveUpdatedAt] = useState(updatedAt)

  useEffect(() => {
    fetch('/api/exchange-rates')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.rates) {
          setLiveRates(data.rates)
          setLiveUpdatedAt(data.updatedAt ?? null)
        }
      })
      .catch(() => {})
  }, [])

  const updatedLabel = useMemo(() => {
    if (!liveUpdatedAt) return null
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(liveUpdatedAt))
    } catch {
      return liveUpdatedAt.slice(0, 10)
    }
  }, [liveUpdatedAt, locale])

  const renderPrice = (row: Row) => {
    if (row.pricePLN == null) return null
    const main = convert(row.pricePLN, currency, liveRates)
    const mainStr = formatPrice(main, locale)
    if (row.priceMaxPLN != null) {
      const max = convert(row.priceMaxPLN, currency, rates)
      return `${mainStr} – ${formatPrice(max, locale)}`
    }
    if (row.pricePLNDiscount != null) {
      const disc = convert(row.pricePLNDiscount, currency, rates)
      return (
        <>
          {mainStr}
          <span className="ml-2 text-sm opacity-70">({formatPrice(disc, locale)}*)</span>
        </>
      )
    }
    return mainStr
  }

  return (
    <section
      id={blockName || undefined}
      className={cn({
        'bg-card-foreground': changeBackground,
        'pt-14': addMarginTop,
        'pb-14': addMarginBottom,
      })}
    >
      <div className="">
        {hasRichTextContent(heading) && (
          <RichText className=" pb-6" content={heading} enableGutter={false} />
        )}

        <div className="">
          <div
            id="ticketprices"
            className="flex flex-wrap items-center gap-3 mb-6 text-sm scroll-mt-24"
          >
            <span className="font-medium">{t('ticket-prices-currency')}:</span>
            <div className="inline-flex rounded-lg overflow-hidden border border-foreground/20">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={cn(
                    'px-3 py-1 transition-colors',
                    currency === c ? 'bg-foreground text-background' : 'hover:bg-foreground/10',
                  )}
                  aria-pressed={currency === c}
                >
                  {c}
                </button>
              ))}
            </div>
            {currency !== 'PLN' && (
              <span className="opacity-70">
                1 zł ≈ {liveRates[currency].toFixed(currency === 'GBP' ? 4 : 3)} {SYMBOLS[currency]}
              </span>
            )}
            {updatedLabel && (
              <span className="opacity-60 text-xs">
                · {t('ticket-prices-updated')} {updatedLabel}
                {source ? ` · ${t('ticket-prices-source')}: ${source}` : ''}
              </span>
            )}
          </div>

          <div className="grid gap-8">
            {sections?.map((section, idx) => (
              <div
                key={section.id || idx}
                className={cn(
                  'rounded-xl border border-foreground/15 p-5',
                  changeBackground ? 'bg-background' : 'bg-card-foreground',
                )}
              >
                {section.title && <h3 className="text-xl font-semibold mb-2">{section.title}</h3>}
                {hasRichTextContent(section.intro) && (
                  <RichText
                    className="mb-4 text-base"
                    content={section.intro}
                    enableGutter={false}
                  />
                )}

                {section.rows &&
                  section.rows.length > 0 &&
                  (section.columnHeaders && section.columnHeaders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-base border-collapse">
                        <thead>
                          <tr className="border-b border-foreground/20">
                            <th className="py-2 pr-4 text-left font-semibold">
                              {section.rowLabelHeader || ''}
                            </th>
                            {section.columnHeaders.map((c, cIdx) => (
                              <th
                                key={c.id || cIdx}
                                className="py-2 px-2 text-right font-semibold whitespace-nowrap"
                              >
                                {c.header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.rows.map((row, rIdx) => (
                            <tr
                              key={row.id || rIdx}
                              className="border-t border-foreground/10 first:border-t-0"
                            >
                              <td className="py-2 pr-4 align-top">
                                <div className="font-medium md:whitespace-nowrap">{row.label}</div>
                                {row.sublabel && (
                                  <div className="text-sm opacity-70">{row.sublabel}</div>
                                )}
                              </td>
                              {section.columnHeaders!.map((_, cIdx) => {
                                const cell = row.pricesPLN?.[cIdx]
                                return (
                                  <td
                                    key={cIdx}
                                    className="py-2 px-2 text-right whitespace-nowrap tabular-nums font-semibold align-top"
                                  >
                                    {cell != null
                                      ? formatPrice(convert(cell.value, currency, liveRates), locale)
                                      : '—'}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <table className="w-full text-base border-collapse">
                      <tbody>
                        {section.rows.map((row, rIdx) => (
                          <tr
                            key={row.id || rIdx}
                            className="border-t border-foreground/10 first:border-t-0"
                          >
                            <td className="py-2 pr-4 align-top">
                              <div className="font-medium md:whitespace-nowrap">{row.label}</div>
                              {row.sublabel && (
                                <div className="text-sm opacity-70">{row.sublabel}</div>
                              )}
                            </td>
                            <td className="py-2 text-right whitespace-nowrap align-top">
                              <div className="font-semibold tabular-nums">{renderPrice(row)}</div>
                              {/* {row.unit && <div className="text-xs opacity-70">{row.unit}</div>} */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ))}
                {section.rows && section.rows.length > 0 && (
                  <div className="text-md  mb-2 text-right flex flex-row items-center justify-end opacity-70">
                    <Link
                      href="#prices"
                      className="underline hover:opacity-100 hover:no-underline "
                    >
                      {t('ticket-prices-currency')}
                    </Link>
                    :{' '}
                    <div className="ml-2 opacity-100">
                      {currency} ({SYMBOLS[currency]})
                    </div>
                  </div>
                )}
                {hasRichTextContent(section.footnote) && (
                  <RichText
                    className="mt-3 text-sm opacity-80"
                    content={section.footnote}
                    enableGutter={false}
                    enableProse={false}
                  />
                )}
              </div>
            ))}
          </div>

          {hasRichTextContent(warning) && (
            <div className="mt-8 rounded-xl border-l-4 border-amber-500 bg-amber-500/10 p-4">
              <RichText content={warning} enableGutter={false} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
