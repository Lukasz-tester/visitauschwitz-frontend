'use client'

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
import dynamic from 'next/dynamic'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from 'src/utilities/cn'
import type { Page } from '@/payload-types'
const LazyRichText = dynamic(() => import('@/components/RichText'), {
  loading: () => <div>Loading content…</div>,
  ssr: true,
})

type Props = Extract<Page['layout'][0], { blockType: 'accordion' }> & {
  fullUrl?: string
}

type StoredState = {
  openIndices: number[]
  heights: Record<number, number>
}

function readStorage(key: string): StoredState {
  if (typeof window === 'undefined') return { openIndices: [], heights: {} }
  try {
    const stored = sessionStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch {}
  return { openIndices: [], heights: {} }
}

export const AccordionBlock: React.FC<{ id?: string } & Props> = ({
  id,
  accordionItems = [],
  changeBackground = false,
  addPaddingBottom = false,
  blockName,
  fullUrl,
}) => {
  const storageKey = `accordion-state-${fullUrl || ''}-${blockName || id || 'default'}`
  const [hasMounted, setHasMounted] = useState(false)

  // Read from sessionStorage on first render so the layout is correct before scroll restoration
  const [openIndices, setOpenIndices] = useState<number[]>(
    () => readStorage(storageKey).openIndices,
  )
  const [storedHeights, setStoredHeights] = useState<Record<number, number>>(
    () => readStorage(storageKey).heights,
  )

  useIsomorphicLayoutEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!hasMounted) return
    try {
      const state: StoredState = { openIndices, heights: storedHeights }
      sessionStorage.setItem(storageKey, JSON.stringify(state))
    } catch {}
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
          <LazyRichText content={answer} enableGutter={false} />
        </div>
      </div>
    </article>
  )
}
