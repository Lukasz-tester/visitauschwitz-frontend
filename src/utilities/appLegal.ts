import fs from 'fs'
import path from 'path'

// Loader for the app legal snapshot produced by fetch-app-legal.ts. Read at build
// time (pages are force-static), with an English fallback for locales that have no
// translated copy yet.

export interface LegalDoc {
  version?: string
  /** ISO timestamp of the last publish — rendered as "Last updated". */
  effectiveDate?: string
  body: string[]
}

export type LegalKind = 'privacy' | 'terms'

type Snapshot = Record<string, Partial<Record<LegalKind, LegalDoc>>>

let cache: Snapshot | null = null

function load(): Snapshot {
  if (cache) return cache
  try {
    cache = JSON.parse(
      fs.readFileSync(path.resolve('./app-legal-data.json'), 'utf-8'),
    ) as Snapshot
  } catch {
    cache = {}
  }
  return cache
}

export function getAppLegalDoc(
  locale: string,
  kind: LegalKind,
): LegalDoc | null {
  const data = load()
  return data[locale]?.[kind] ?? data['en']?.[kind] ?? null
}

const UPDATED_LABEL: Record<string, string> = {
  en: 'Last updated',
  pl: 'Ostatnia aktualizacja',
}

/** Localized "Last updated: <date>" line, or undefined when no publish date. */
export function formatLegalUpdated(
  doc: LegalDoc | null,
  locale: string,
): string | undefined {
  if (!doc?.effectiveDate) return undefined
  const date = new Date(doc.effectiveDate)
  if (Number.isNaN(date.getTime())) return undefined
  let formatted: string
  try {
    formatted = date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    formatted = doc.effectiveDate.slice(0, 10)
  }
  return `${UPDATED_LABEL[locale] ?? UPDATED_LABEL.en}: ${formatted}`
}
