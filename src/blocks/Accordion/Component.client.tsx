'use client'

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from 'src/utilities/cn'
import type { Page } from '@/payload-types'
import RichText from '@/components/RichText'

type Props = Extract<Page['layout'][0], { blockType: 'accordion' }> & {
  fullUrl?: string
}

type StoredState = {
  openIndices: number[]
  heights: Record<number, number>
}

function readStorage(key: string): StoredState {
  try {
    const stored = sessionStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        openIndices: Array.isArray(parsed.openIndices) ? parsed.openIndices : [],
        heights: parsed.heights && typeof parsed.heights === 'object' ? parsed.heights : {},
      }
    }
  } catch { }
  return { openIndices: [], heights: {} }
}

// After initial hydration this becomes true, so client-side navigations
// (back/forward) can restore state from sessionStorage.
// On hard reload the module re-evaluates and resets to false → fresh start.
let hasHydrated = false

export const AccordionBlock: React.FC<{ id?: string } & Props> = ({
  id,
  accordionItems = [],
  changeBackground = false,
  addPaddingBottom = false,
  isFAQ = false,
  blockName,
  fullUrl,
}) => {
  const storageKey = `accordion-state-${fullUrl || ''}-${blockName || id || 'default'}`
  const [hasMounted, setHasMounted] = useState(false)

  const [openIndices, setOpenIndices] = useState<number[]>(() =>
    hasHydrated ? readStorage(storageKey).openIndices : [],
  )
  const [storedHeights, setStoredHeights] = useState<Record<number, number>>(() =>
    hasHydrated ? readStorage(storageKey).heights : {},
  )

  useIsomorphicLayoutEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    hasHydrated = true
  }, [])

  useEffect(() => {
    if (!hasMounted) return
    try {
      const state: StoredState = { openIndices, heights: storedHeights }
      sessionStorage.setItem(storageKey, JSON.stringify(state))
    } catch { }
  }, [openIndices, storedHeights, storageKey, hasMounted])

  const handleHeightMeasured = useCallback((index: number, height: number) => {
    setStoredHeights((prev) => {
      if (prev[index] === height) return prev
      return { ...prev, [index]: height }
    })
  }, [])

  const handleItemClick = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  return (
    <section
      className={cn('w-full m-0 mt-14 place-self-center', {
        'bg-card-foreground mt-0': changeBackground,
      })}
    >
      <div className="container" id={blockName || undefined}>
        <div className={cn('md:px-[17.3%]', { 'pb-24': addPaddingBottom })}>
          {accordionItems?.map((item, index) => {
            if (isFAQ) {
              return (
                <div key={index} className="pb-2">
                  <details
                    className={cn(
                      'details-animate overflow-hidden rounded-xl border border-slate-500/40 hover:border-amber-600 dark:hover:border-amber-700/70 open:border-amber-600 dark:open:border-amber-700/70',
                      changeBackground ? 'bg-background' : 'bg-card',
                    )}
                    open={openIndices.includes(index)}
                  >
                    <summary
                      className={cn(
                        'w-full cursor-pointer p-3 text-start text-xl opacity-85 list-none [&::-webkit-details-marker]:hidden font-semibold',
                        changeBackground ? 'bg-card' : 'bg-card-foreground',
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        handleItemClick(index)
                      }}
                    ><h3>
                        {item.question}
                      </h3></summary>
                    <div className="px-5 py-2 mb-4">
                      {item.answer && <RichText content={item.answer} enableGutter={false} />}
                    </div>
                  </details>
                </div>
              )
            }

            const uniqueId = `accordion-item-${item.id}`
            return (
              <div key={index} className="pb-2">
                <AccordionItem
                  index={index}
                  uniqueId={uniqueId}
                  answer={item.answer}
                  question={item.question ?? ''}
                  isOpen={openIndices.includes(index)}
                  initialHeight={storedHeights[index] ?? 0}
                  onClick={() => handleItemClick(index)}
                  onHeightMeasured={handleHeightMeasured}
                  changedBackground={!!changeBackground}
                  hasMounted={hasMounted}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

type ItemProps = {
  index: number
  uniqueId: string
  question: string
  answer: any
  isOpen: boolean
  initialHeight: number
  onClick: () => void
  onHeightMeasured: (index: number, height: number) => void
  changedBackground: boolean
  hasMounted: boolean
}

const AccordionItem: React.FC<ItemProps> = ({
  index,
  question,
  answer,
  isOpen,
  initialHeight,
  onClick,
  onHeightMeasured,
  changedBackground,
  uniqueId,
  hasMounted,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [measuredHeight, setMeasuredHeight] = useState(initialHeight)

  useIsomorphicLayoutEffect(() => {
    if (contentRef.current && isOpen) {
      const h = contentRef.current.scrollHeight
      onHeightMeasured(index, h)
      if (measuredHeight === 0) {
        // First open — defer so browser sees maxHeight: 0 first, then animates to h
        requestAnimationFrame(() => setMeasuredHeight(h))
      } else {
        setMeasuredHeight(h)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, index, onHeightMeasured])

  return (
    <article
      className={cn(
        '[&_*]:ease-in-out [&_*]:duration-700 overflow-hidden rounded-xl border hover:border-amber-600 dark:hover:border-amber-700/70',
        isOpen ? 'border-amber-600 dark:border-amber-700/70' : 'border-slate-500/40',
        changedBackground ? 'bg-background' : 'bg-card',
      )}
    >
      <button
        className={cn(
          'bg-card-foreground w-full p-3 text-start text-xl opacity-85 flex place-content-between',
          {
            'bg-card': changedBackground,
          },
        )}
        onClick={onClick}
        id={uniqueId}
        aria-expanded={isOpen}
        aria-controls={`content-${uniqueId}`}
      >
        <h3 className="pr-2 text-left font-semibold">{question}</h3>
        {isOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
      </button>

      <div
        id={`content-${uniqueId}`}
        ref={contentRef}
        className={cn(
          'px-5 overflow-hidden',
          hasMounted && 'transition-[max-height] duration-500 ease-in-out',
        )}
        role="region"
        aria-labelledby={uniqueId}
        style={hasMounted ? { maxHeight: isOpen ? measuredHeight : 0 } : undefined}
      >
        <div className="py-2 mb-4">
          <RichText content={answer} enableGutter={false} />
        </div>
      </div>
    </article>
  )
}
