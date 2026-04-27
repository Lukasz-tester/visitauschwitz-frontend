'use client'

import React, { useState, useEffect, useLayoutEffect } from 'react'

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
}

function readStorage(key: string): StoredState {
  try {
    const stored = sessionStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        openIndices: Array.isArray(parsed.openIndices) ? parsed.openIndices : [],
      }
    }
  } catch {}
  return { openIndices: [] }
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

  useIsomorphicLayoutEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    hasHydrated = true
  }, [])

  useEffect(() => {
    if (!hasMounted) return
    try {
      const state: StoredState = { openIndices }
      sessionStorage.setItem(storageKey, JSON.stringify(state))
    } catch {}
  }, [openIndices, storageKey, hasMounted])

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
                      'overflow-hidden rounded-xl border hover:border-amber-600 dark:hover:border-amber-700/70',
                      openIndices.includes(index)
                        ? 'border-amber-600 dark:border-amber-700/70'
                        : 'border-slate-500/40',
                      changeBackground ? 'bg-background' : 'bg-card',
                    )}
                    open
                  >
                    <summary
                      className={cn(
                        'w-full cursor-pointer p-3 text-start text-xl opacity-85 list-none [&::-webkit-details-marker]:hidden tracking-wide font-medium flex place-content-between',
                        changeBackground ? 'bg-card' : 'bg-card-foreground',
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        handleItemClick(index)
                      }}
                    >
                      <h3>{item.question}</h3>
                      {openIndices.includes(index) ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                    </summary>
                    <div
                      className={cn(
                        'grid',
                        hasMounted && 'transition-[grid-template-rows] duration-500 ease-in-out',
                        openIndices.includes(index) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pt-2 pb-3">
                          {item.answer && <RichText content={item.answer} enableGutter={false} />}
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              )
            }

            const uniqueId = `accordion-item-${item.id}`
            return (
              <div key={index} className="pb-2">
                <AccordionItem
                  uniqueId={uniqueId}
                  answer={item.answer}
                  question={item.question ?? ''}
                  isOpen={openIndices.includes(index)}
                  onClick={() => handleItemClick(index)}
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
  uniqueId: string
  question: string
  answer: any
  isOpen: boolean
  onClick: () => void
  changedBackground: boolean
  hasMounted: boolean
}

const AccordionItem: React.FC<ItemProps> = ({
  question,
  answer,
  isOpen,
  onClick,
  changedBackground,
  uniqueId,
  hasMounted,
}) => {
  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl border hover:border-amber-600 dark:hover:border-amber-700/70',
        isOpen ? 'border-amber-600 dark:border-amber-700/70' : 'border-slate-500/40',
        changedBackground ? 'bg-background' : 'bg-card',
      )}
    >
      <button
        className={cn(
          'bg-card-foreground w-full p-3 text-start text-xl opacity-85 flex place-content-between',
          { 'bg-card': changedBackground },
        )}
        onClick={onClick}
        id={uniqueId}
        aria-expanded={isOpen}
        aria-controls={`content-${uniqueId}`}
      >
        <h3 className="pr-2 text-left font-medium tracking-wide">{question}</h3>
        {isOpen ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
      </button>

      <div
        id={`content-${uniqueId}`}
        className={cn(
          'grid',
          hasMounted && 'transition-[grid-template-rows] duration-500 ease-in-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        role="region"
        aria-labelledby={uniqueId}
      >
        <div className="overflow-hidden px-5">
          <div className="py-2 mb-4">
            <RichText content={answer} enableGutter={false} />
          </div>
        </div>
      </div>
    </article>
  )
}

export const AccordionBlockMemo = React.memo(AccordionBlock)
