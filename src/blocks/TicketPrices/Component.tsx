import React from 'react'
import type { TypedLocale } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { TicketPricesClient } from './Component.client'

type ExchangeRatesGlobal = {
  baseCurrency?: string | null
  rates?: { EUR?: number | null; USD?: number | null; GBP?: number | null } | null
  updatedAt?: string | null
  source?: string | null
}

type Props = {
  heading?: any
  sections?: any[] | null
  warning?: any
  changeBackground?: boolean | null
  addMarginTop?: boolean | null
  addMarginBottom?: boolean | null
  blockName?: string | null
  locale: TypedLocale
}

export const TicketPricesBlock: React.FC<Props> = async (props) => {
  let rates: { EUR: number; USD: number; GBP: number } = { EUR: 0.23, USD: 0.25, GBP: 0.19 }
  let updatedAt: string | null = null
  let source = 'frankfurter.app'

  try {
    const data = await getCachedGlobal<ExchangeRatesGlobal>('exchange-rates', 0, props.locale)()
    if (data?.rates) {
      rates = {
        EUR: data.rates.EUR ?? rates.EUR,
        USD: data.rates.USD ?? rates.USD,
        GBP: data.rates.GBP ?? rates.GBP,
      }
    }
    updatedAt = data?.updatedAt ?? null
    source = data?.source ?? source
  } catch {
    // Fall back to defaults above so the block still renders.
  }

  return <TicketPricesClient {...props} rates={rates} updatedAt={updatedAt} source={source} />
}
