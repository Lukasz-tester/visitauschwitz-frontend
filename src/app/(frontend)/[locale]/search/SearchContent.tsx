'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Card } from '@/components/Card'

import type { Post, Media } from '@/payload-types'

type SearchResult = {
  id: string
  title: string
  slug: string
  doc: { relationTo: 'posts' | 'pages'; value: string }
  meta?: {
    title?: string | null
    description?: string | null
    image?: (string | null) | Media
  }
  categories?: { relationTo: string; categoryID: string; title: string }[]
}

type SearchResponse = {
  docs: SearchResult[]
  totalDocs: number
}

export const SearchContent: React.FC = () => {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()

  const [query, setQuery] = useState(q)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchResults = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setSearched(false)
        return
      }

      setLoading(true)
      try {
        const encoded = encodeURIComponent(searchQuery)
        const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL
        const res = await fetch(
          `${cmsUrl}/api/search?locale=${locale}&depth=1&where[or][0][title][like]=${encoded}&where[or][1][meta.title][like]=${encoded}&where[or][2][meta.description][like]=${encoded}`,
        )
        if (res.ok) {
          const data: SearchResponse = await res.json()
          setResults(data.docs || [])
        } else {
          setResults([])
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
        setSearched(true)
      }
    },
    [locale],
  )

  useEffect(() => {
    setQuery(q)
    fetchResults(q)
  }, [q, fetchResults])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto mb-12">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full px-4 py-3 pr-12 border border-border rounded bg-card text-foreground focus:outline-none focus:border-amber-600"
          autoFocus
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
          aria-label={t('search')}
        >
          <Search size={20} />
        </button>
      </form>

      {loading && <p className="text-center opacity-70">...</p>}

      {!loading && searched && q && results.length === 0 && (
        <p className="text-center opacity-70">{t('noResults')}</p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-7 gap-x-7 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {results.map((result) => {
            const doc: Partial<Post> = {
              slug: result.slug,
              meta: {
                title: result.meta?.title ?? null,
                description: result.meta?.description ?? null,
                image: result.meta?.image ?? null,
              },
              categories: result.categories?.map((cat) => cat.categoryID) ?? [],
            }

            return (
              <div className="col-span-4" key={result.id}>
                <Card
                  className="h-full"
                  doc={doc as Post}
                  relationTo={result.doc.relationTo}
                  title={result.title}
                />
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
