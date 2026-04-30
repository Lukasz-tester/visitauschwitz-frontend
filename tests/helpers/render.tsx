import { render as rtlRender } from '@testing-library/react'
import type { ReactElement } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import enMessages from '@/i18n/messages/en.json'

type Options = { locale?: 'en' | 'pl'; messages?: Record<string, string> }

export function renderWithIntl(ui: ReactElement, opts: Options = {}) {
  const { locale = 'en', messages = enMessages as Record<string, string> } = opts
  return rtlRender(
    <NextIntlClientProvider locale={locale} messages={messages} now={new Date('2024-01-01')}>
      {ui}
    </NextIntlClientProvider>,
  )
}
