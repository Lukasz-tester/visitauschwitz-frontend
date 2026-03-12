'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/utilities/cn'
import { List, X } from 'lucide-react'
import { useScrolledFromTop } from '@/utilities/helpers'

export type TocItem = {
  id: string
  label: string
  divider?: boolean
  indent?: boolean
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const scrolled = useScrolledFromTop()
  const activeRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-10% 0% -70% 0%', threshold: 0 },
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  // Auto-scroll the active item into view within the TOC list
  useEffect(() => {
    if (activeRef.current && listRef.current) {
      const list = listRef.current
      const btn = activeRef.current
      const listRect = list.getBoundingClientRect()
      const btnRect = btn.getBoundingClientRect()
      if (btnRect.top < listRect.top || btnRect.bottom > listRect.bottom) {
        btn.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [activeId])

  const handleClick = useCallback((id: string) => {
    if (id === '_hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const el = document.getElementById(id)
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
    setIsOpen(false)
    window.dispatchEvent(new CustomEvent('close-mobile-nav'))
  }, [])

  return (
    <>
      {/* Toggle button - to the left of the map button at bottom-right */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-4 right-[5.5rem] z-40 flex items-center justify-center [[data-map-open]_&]:hidden',
          'w-14 h-14 rounded-full shadow-lg',
          'bg-background/80 md:hover:bg-card-foreground',
          'transition-colors duration-500 dark:text-white/80 text-black/70',
          isOpen && 'bg-card right-4 sm:right-[5.5rem]',
          scrolled ? '' : 'hidden sm:flex',
        )}
        aria-label={isOpen ? 'Close table of contents' : 'Open table of contents'}
      >
        {isOpen ? <X strokeWidth={1} size={28} /> : <List strokeWidth={1.5} size={28} />}
      </button>
      {/* LIST label - only visible when mobile nav is open */}
      {!isOpen && (
        <span
          className={cn(
            'hidden [[data-mobile-nav=open]_&]:block [[data-map-open]_&]:!hidden fixed bottom-1 right-[5.5rem] w-14 text-center text-[10px] font-semibold dark:text-white/80 text-black/70 z-40',
            !scrolled && 'max-sm:!hidden',
          )}
        >
          LIST
        </span>
      )}

      {/* Sidebar panel */}
      <nav
        className={cn(
          'fixed left-0 top-0 z-30 h-screen w-80 bg-background/95 backdrop-blur-sm border-r border-border shadow-lg',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Table of contents"
      >
        <ul
          ref={listRef}
          className="h-full overflow-y-auto py-6 pl-6 pr-4 space-y-0.5 overscroll-contain"
        >
          {items.map((item) => (
            <li key={item.id} className={item.indent ? 'pl-3' : undefined}>
              <button
                ref={activeId === item.id ? activeRef : undefined}
                onClick={() => handleClick(item.id)}
                className={cn(
                  'text-left text-sm leading-snug hover:text-foreground transition-colors duration-200 w-full py-1 px-2 rounded',
                  activeId === item.id
                    ? 'text-foreground bg-card-foreground'
                    : 'text-muted-foreground hover:bg-accent/50',
                )}
              >
                {item.label}
              </button>
              {item.divider && <hr className="my-2 border-border" />}
            </li>
          ))}
        </ul>
      </nav>

      {/* Backdrop overlay when open */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/20" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
