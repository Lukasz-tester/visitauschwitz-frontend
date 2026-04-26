'use client'

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { cn } from 'src/utilities/cn'
import RichText from '@/components/RichText'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

type Props = {
  heading?: any
  currencies?: any[]
  changeBackground?: boolean
  blockName?: string
  blikHeading?: any
  blikButton?: string
}

type CurrencyItem = {
  currencyLabel?: string
  reference?: string
  recipient?: string
  iban?: string
  bicSwift?: string
  routingNumber?: string
  accountNumber?: string
  sortCode?: string
  bankName?: string
  currencyCode?: string
  recommendedFor?: any
}

const CopyField: React.FC<{ label: string; value: string | undefined; transform?: (value: string) => string }> = ({ label, value, transform }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(transform ? transform(value) : value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (!value) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-500/30 last:border-0 gap-1">
      <span className="text-base opacity-70 whitespace-nowrap mr-3">{label}</span>
      <div className="flex items-center justify-between w-full sm:w-auto gap-2">
        <span className="text-base font-medium break-words flex-1">{value}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-slate-500/20 transition-colors flex-shrink-0"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

const BankTransferItem: React.FC<{
  currency: CurrencyItem
  isOpen: boolean
  onToggle: () => void
  index: number
  t: any
}> = ({ currency, isOpen, onToggle, index, t }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [measuredHeight, setMeasuredHeight] = useState(0)
  const [hasMounted, setHasMounted] = useState(false)
  const [allCopied, setAllCopied] = useState(false)

  useIsomorphicLayoutEffect(() => {
    setHasMounted(true)
  }, [])

  useIsomorphicLayoutEffect(() => {
    if (contentRef.current && isOpen) {
      const h = contentRef.current.scrollHeight
      if (measuredHeight === 0) {
        // First open — defer so browser sees maxHeight: 0 first, then animates to h
        requestAnimationFrame(() => setMeasuredHeight(h))
      } else {
        setMeasuredHeight(h)
      }
    } else if (!isOpen) {
      setMeasuredHeight(0)
    }
  }, [isOpen, measuredHeight])

  return (
    <div className="pb-2">
      <article
        className={cn(
          '[&_*]:ease-in-out [&_*]:duration-300 overflow-hidden rounded-xl border',
          isOpen ? 'border-amber-600 dark:border-amber-700/70' : 'border-slate-500/40 hover:border-amber-600 dark:hover:border-amber-700/70',
          'bg-card',
        )}
      >
        <button
          className="bg-card-foreground w-full p-4 text-start text-xl opacity-85 flex place-content-between"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <h3 className="pr-2 text-left font-medium tracking-wide">{currency.currencyLabel}</h3>
          {isOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
        </button>

        <div
          ref={contentRef}
          className={cn(
            'px-5 overflow-hidden',
            hasMounted && 'transition-[max-height] duration-500 ease-in-out',
          )}
          style={hasMounted ? { maxHeight: isOpen ? measuredHeight : 0 } : undefined}
        >
          <div className="py-4 space-y-1">
            {currency.recommendedFor && (
              <div className="py-2 mb-4">
                <RichText content={currency.recommendedFor} enableGutter={false} />
              </div>
            )}
            <CopyField label={t('bank-reference')} value={currency.reference || t('bank-reference-info')} />
            <CopyField label={t('bank-recipient')} value={currency.recipient} />
            <CopyField label="IBAN" value={currency.iban} transform={(v) => v.replace(/\s/g, '')} />
            <CopyField label="BIC / SWIFT" value={currency.bicSwift} />
            <CopyField label={t('bank-routing-number')} value={currency.routingNumber} />
            <CopyField label={t('bank-account-number')} value={currency.accountNumber} transform={(v) => v.replace(/\s/g, '')} />
            <CopyField label={t('bank-sort-code')} value={currency.sortCode} transform={(v) => v.replace(/-/g, '')} />
            <CopyField label={t('bank-name')} value={currency.bankName} />
            {currency.currencyCode && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-500/30 gap-1">
                <span className="text-base opacity-70 whitespace-nowrap">{t('bank-currency')}</span>
                <span className="text-base font-medium">{currency.currencyCode}</span>
              </div>
            )}
            <button
              onClick={async () => {
                const details = [
                  currency.reference ? `${t('bank-reference')}: ${currency.reference}` : `${t('bank-reference')}: ${t('bank-reference-info')}`,
                  currency.recipient ? `${t('bank-recipient')}: ${currency.recipient}` : null,
                  currency.iban ? `IBAN: ${currency.iban.replace(/\s/g, '')}` : null,
                  currency.bicSwift ? `BIC / SWIFT: ${currency.bicSwift}` : null,
                  currency.routingNumber ? `${t('bank-routing-number')}: ${currency.routingNumber}` : null,
                  currency.accountNumber ? `${t('bank-account-number')}: ${currency.accountNumber.replace(/\s/g, '')}` : null,
                  currency.sortCode ? `${t('bank-sort-code')}: ${currency.sortCode.replace(/-/g, '')}` : null,
                  currency.bankName ? `${t('bank-name')}: ${currency.bankName}` : null,
                  currency.currencyCode ? `${t('bank-currency')}: ${currency.currencyCode}` : null,
                ]
                  .filter(Boolean)
                  .join('\n')
                try {
                  await navigator.clipboard.writeText(details)
                  setAllCopied(true)
                  setTimeout(() => setAllCopied(false), 2000)
                } catch (err) {
                  console.error('Failed to copy:', err)
                }
              }}
              className="mt-4 w-full py-2 px-4 bg-card hover:bg-card/80 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {allCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {t('copy-all')}
            </button>
          </div>
        </div>
      </article>
    </div>
  )
}

export const BankTransferBlock: React.FC<Props> = ({
  heading,
  currencies,
  changeBackground = false,
  blockName,
  blikHeading,
  blikButton,
}) => {
  const t = useTranslations()
  const [openIndices, setOpenIndices] = useState<number[]>([])
  const [blikCopied, setBlikCopied] = useState(false)

  const handleToggle = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  const handleBlikCopy = async () => {
    try {
      await navigator.clipboard.writeText('502983333')
      setBlikCopied(true)
      setTimeout(() => setBlikCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <section
      id={blockName || undefined}
      className={cn('w-full m-0 md:mt-14 place-self-center', {
        'bg-card-foreground mt-0': changeBackground,
      })}
    >
      <div className="container">
          <div className="grid grid-cols-4 lg:grid-cols-12 gap-6 md:gap-14">
            {(blikHeading || blikButton) && (
              <div className="col-span-4 lg:col-span-4 pb-12">
               
                  {blikHeading && (
                    <RichText
                      className="mb-6"
                      content={blikHeading}
                      enableGutter={false}
                    />
                  )}
                  {blikButton && (
                    <button
                      onClick={handleBlikCopy}
                      className="bg-card-foreground text-nowrap px-3 mx-0.5 py-0 font-normal no-underline rounded-xl text-xl leading-[2.6] border border-slate-500/40 dark:hover:bg-slate-700/80 hover:bg-slate-400/50 transition-colors flex items-center justify-center gap-2"
                    >
                      {blikCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {blikButton}
                    </button>
                  )}
              </div>
            )}
            <div className="col-span-4 lg:col-span-8">
              {heading && (
                <RichText
                  className="mb-14"
                  content={heading}
                  enableGutter={false}
                />
              )}
              {currencies?.map((currency, index) => (
                <BankTransferItem
                  key={index}
                  currency={currency as CurrencyItem}
                  isOpen={openIndices.includes(index)}
                  onToggle={() => handleToggle(index)}
                  index={index}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>
    </section>
  )
}
