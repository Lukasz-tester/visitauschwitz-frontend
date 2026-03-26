'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Card } from '@/components/Card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

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

const PAGE_CATEGORY_MAP: Record<string, string[]> = {
  tickets: ['Visiting', 'Preparation'],
  arrival: ['Preparation'],
  museum: ['Museum'],
  tour: ['Exhibition', 'Visiting'],
  faq: ['Visiting', 'History'],
  supplement: ['Preparation', 'Museum'],
}

export const SearchContent: React.FC<{ cmsUrl: string }> = ({ cmsUrl }) => {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()

  const [query, setQuery] = useState(q)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const [categories, setCategories] = useState<{ id: string; title: string }[]>([])
  const [allChecked, setAllChecked] = useState(true)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`${cmsUrl}/api/categories?locale=${locale}&depth=0&limit=100`)
      .then((res) => (res.ok ? res.json() : { docs: [] }))
      .then((data) =>
        setCategories(
          (data.docs || []).map((c: { id: string; title: string }) => ({
            id: c.id,
            title: c.title,
          })),
        ),
      )
      .catch(() => {})
  }, [locale, cmsUrl])

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
        const res = await fetch(
          `${cmsUrl}/api/search?locale=${locale}&depth=1&where[or][0][title][like]=${encoded}&where[or][1][meta.title][like]=${encoded}&where[or][2][meta.description][like]=${encoded}`,
        )
        if (res.ok) {
          const data: SearchResponse = await res.json()
          setResults(data.docs || [])
        } else {
          setResults([])
        }
      } catch (err) {
        console.error('Search fetch failed:', err)
        setResults([])
      } finally {
        setLoading(false)
        setSearched(true)
      }
    },
    [locale, cmsUrl],
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

  const filteredResults = useMemo(() => {
    if (allChecked || selectedCategoryIds.size === 0) return results

    const titleToId = new Map(categories.map((c) => [c.title, c.id]))

    return results.filter((r) => {
      if (r.doc.relationTo === 'pages') {
        const mappedTitles = PAGE_CATEGORY_MAP[r.slug] || []
        if (mappedTitles.length === 0) return true
        const mappedIds = mappedTitles
          .map((t) => titleToId.get(t))
          .filter(Boolean) as string[]
        return mappedIds.some((id) => selectedCategoryIds.has(id))
      }

      if (!r.categories?.length) return true
      return r.categories.some((c) => selectedCategoryIds.has(c.categoryID))
    })
  }, [results, allChecked, selectedCategoryIds, categories])

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

      {categories.length > 0 && results.length > 0 && (
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Checkbox
              id="category-all"
              checked={allChecked}
              onCheckedChange={(checked) => {
                setAllChecked(!!checked)
                if (checked) {
                  setSelectedCategoryIds(new Set())
                }
              }}
            />
            <Label htmlFor="category-all">{t('allCategories')}</Label>
          </div>

          {!allChecked && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 pl-6">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`category-${cat.id}`}
                    checked={selectedCategoryIds.has(cat.id)}
                    onCheckedChange={(checked) => {
                      setSelectedCategoryIds((prev) => {
                        const next = new Set(prev)
                        if (checked) {
                          next.add(cat.id)
                        } else {
                          next.delete(cat.id)
                        }
                        return next
                      })
                    }}
                  />
                  <Label htmlFor={`category-${cat.id}`}>{cat.title}</Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && <p className="text-center opacity-70">...</p>}

      {!loading && searched && q && results.length === 0 && (
        <p className="text-center opacity-70">{t('noResults')}</p>
      )}

      {!loading && results.length > 0 && filteredResults.length === 0 && (
        <p className="text-center opacity-70">{t('noResultsForCategory')}</p>
      )}

      {filteredResults.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-7 gap-x-7 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {filteredResults.map((result) => {
            const doc: Partial<Post> = {
              slug: result.slug,
              meta: {
                title: result.meta?.title ?? null,
                description: result.meta?.description ?? null,
                image: result.meta?.image ?? null,
              },
              categories: result.categories?.map((cat) => cat.categoryID) ?? [],
            }

            const cardTitle =
              result.doc.relationTo === 'pages'
                ? (result.meta?.title || result.title)
                : result.title

            return (
              <div className="col-span-4" key={result.id}>
                <Card
                  className="h-full"
                  doc={doc as Post}
                  relationTo={result.doc.relationTo}
                  title={cardTitle}
                />
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
