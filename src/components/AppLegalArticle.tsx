import { Container } from '@/components/ui/container'
import type { LegalDoc } from '@/utilities/appLegal'

// Renders an app legal document (Privacy/Terms) fetched from R2. The body is a
// paragraph array with a Markdown-lite heading convention shared with the app's
// ui/LegalBody.tsx: an entry starting with "## " / "# " is a heading.

export function AppLegalArticle({
  title,
  doc,
  unavailable,
  updated,
}: {
  title: string
  doc: LegalDoc | null
  unavailable: string
  /** Pre-formatted "Last updated: …" line. */
  updated?: string
}) {
  return (
    <main className="py-16 md:py-24">
      <Container>
        <article className="prose max-w-none">
          <h1 className="text-3xl md:text-4xl font-serif font-medium mb-8">
            {title}
          </h1>
          {updated ? <p className="text-muted italic mb-8">{updated}</p> : null}
          {!doc || doc.body.length === 0 ? (
            <p className="text-muted">{unavailable}</p>
          ) : (
            doc.body.map((para, i) => renderParagraph(para, i))
          )}
        </article>
      </Container>
    </main>
  )
}

function renderParagraph(para: string, key: number) {
  const heading = para.match(/^(#{1,6})\s+(.*)$/)
  if (heading) {
    const level = Math.min(heading[1].length, 3)
    const text = heading[2]
    // Keep the page's own <h1> the only h1; render doc headings as h2/h3.
    return level <= 2 ? (
      <h2 key={key} className="mt-10 mb-4">
        {text}
      </h2>
    ) : (
      <h3 key={key} className="mt-6 mb-3">
        {text}
      </h3>
    )
  }
  return (
    <p key={key} className="mb-4">
      {para}
    </p>
  )
}
