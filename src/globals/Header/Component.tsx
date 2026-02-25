import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header, TypedLocale } from '@/payload-types'

export async function Header({ locale }: { locale: TypedLocale }) {
  const header = await getCachedGlobal<Header>('header', 1, locale)()

  return <HeaderClient header={header} />
}
