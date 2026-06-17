import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { locales } from '@/i18n/localization'

// Build-time fetch of the mobile app's legal documents.
//
// The Auschwitz Guidebook app's Terms/Privacy live in the *guide-cms* `legal`
// global and are published to Cloudflare R2 at legal/<lang>/<kind>.json (see
// guide-app ARCHITECTURE §6/§7). This is a separate CMS from this website, so we
// can't read them from cms-data.json. Instead we mirror the R2 JSON into a local
// snapshot at build time and render static /guidebook-app/privacy + /guidebook-app/terms pages from
// it. Single source of truth stays the guide-cms `legal` global.

const R2_BASE =
  process.env.GUIDEBOOK_R2_URL ||
  'https://pub-707a9645e0f94e639b0a5e7be9cebe6a.r2.dev'

const KINDS = ['privacy', 'terms'] as const
type Kind = (typeof KINDS)[number]

interface LegalDoc {
  version?: string
  effectiveDate?: string
  body: string[]
}

type Snapshot = Record<string, Partial<Record<Kind, LegalDoc>>>

const OUT = path.resolve('./app-legal-data.json')

function readExisting(): Snapshot {
  try {
    return JSON.parse(fs.readFileSync(OUT, 'utf-8'))
  } catch {
    return {}
  }
}

async function fetchDoc(locale: string, kind: Kind): Promise<LegalDoc | null> {
  const url = `${R2_BASE}/legal/${locale}/${kind}.json`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`  ✗ ${locale}/${kind}: HTTP ${res.status}`)
      return null
    }
    const doc = (await res.json()) as LegalDoc
    if (!Array.isArray(doc.body)) {
      console.warn(`  ✗ ${locale}/${kind}: unexpected shape`)
      return null
    }
    console.log(`  ✓ ${locale}/${kind}: ${doc.body.length} paragraphs`)
    return doc
  } catch (err) {
    console.warn(`  ✗ ${locale}/${kind}: ${(err as Error).message}`)
    return null
  }
}

async function main() {
  console.log(`Fetching app legal docs from ${R2_BASE}/legal/…`)
  const existing = readExisting()
  const next: Snapshot = {}

  for (const locale of locales) {
    next[locale] = { ...existing[locale] }
    for (const kind of KINDS) {
      const doc = await fetchDoc(locale, kind)
      // Preserve the previously-cached copy when R2 is unreachable or the doc
      // isn't published yet, so a transient outage never wipes good content.
      if (doc) next[locale]![kind] = doc
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(next, null, 2))
  console.log(`\n✅ Wrote ${OUT}`)
}

main().catch((err) => {
  // Never fail the build on a legal-fetch problem — the committed snapshot is the
  // fallback. Surface the error but exit cleanly.
  console.error('app-legal fetch error (keeping existing snapshot):', err.message)
  process.exit(0)
})
