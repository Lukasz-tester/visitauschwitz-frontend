import React from 'react'
import type { TypedLocale } from '@/payload-types'
import { TicketPricesClient } from './Component.client'

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

export const TicketPricesBlock: React.FC<Props> = (props) => {
  return (
    <TicketPricesClient
      {...props}
      rates={{ EUR: 0.23, USD: 0.25, GBP: 0.19 }}
      updatedAt={null}
      source="frankfurter.app"
    />
  )
}
