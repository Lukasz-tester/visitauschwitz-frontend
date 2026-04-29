'use client'

import { HelpCircle } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { cn } from '@/utilities/cn'

export function FAQCaller() {
  return (
    <>
      {/* FAQ button - leftmost of the bottom buttons */}
      <Link
        href="/faq/"
        className={cn(
          'fixed bottom-4 right-[10rem] [[data-toc-present]_&]:right-[14.5rem] z-30 items-center justify-center [[data-map-open]_&]:hidden',
          'hidden [[data-mobile-nav=open]_&]:flex',
          'w-14 h-14 rounded-full shadow-lg',
          'bg-background/80 md:hover:bg-card-foreground',
          'transition-colors duration-500 dark:text-white/80 text-black/70',
        )}
        aria-label="FAQ"
      >
        <HelpCircle strokeWidth={1.5} size={26} />
      </Link>

      {/* FAQ label - only visible when mobile nav is open */}
      <span
        className={cn(
          'hidden [[data-mobile-nav=open]_&]:block [[data-map-open]_&]:!hidden fixed bottom-1 right-[10rem] [[data-toc-present]_&]:right-[14.5rem] w-14 text-center text-[10px] font-semibold dark:text-white/80 text-black/70 z-30',
        )}
      >
        FAQ
      </span>
    </>
  )
}
