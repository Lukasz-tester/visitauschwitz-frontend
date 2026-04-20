'use client'

import { useState, useEffect } from 'react'
import { Mail, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/utilities/cn'
import { useLockBodyScroll } from '@/utilities/helpers'
import { ContactForm } from '@/components/ContactForm'

export function NewsletterCaller() {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations()

  useLockBodyScroll(isOpen)

  useEffect(() => {
    document.documentElement.toggleAttribute('data-newsletter-open', isOpen)
    return () => document.documentElement.removeAttribute('data-newsletter-open')
  }, [isOpen])

  useEffect(() => {
    const open = () => setIsOpen(true)
    window.addEventListener('open-contact-form', open)
    return () => window.removeEventListener('open-contact-form', open)
  }, [])

  return (
    <>
      {/* Envelope toggle button — between List and Map */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-4 right-[5.5rem] [[data-toc-present]_&]:right-[10rem] z-40 items-center justify-center [[data-map-open]_&]:hidden',
          'hidden [[data-mobile-nav=open]_&]:flex',
          'w-14 h-14 rounded-full shadow-lg',
          'bg-background/80 md:hover:bg-card-foreground',
          'transition-colors duration-500 dark:text-white/80 text-black/70',
          isOpen && 'bg-card !flex',
        )}
        aria-label={isOpen ? 'Close contact form' : 'Open contact form'}
      >
        {isOpen ? (
          <X strokeWidth={1} size={28} />
        ) : (
          <Mail strokeWidth={1.5} size={26} />
        )}
      </button>

      {/* MAIL label - only visible when mobile nav is open */}
      {!isOpen && (
        <span
          className={cn(
            'hidden [[data-mobile-nav=open]_&]:block [[data-map-open]_&]:!hidden fixed bottom-1 right-[5.5rem] [[data-toc-present]_&]:right-[10rem] w-14 text-center text-[10px] font-semibold dark:text-white/80 text-black/70 z-40',
          )}
        >
          {t('contact')}
        </span>
      )}

      {/* Bottom sheet panel */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg',
          'min-h-[70vh] overflow-y-auto',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="max-w-md mx-auto px-6 pt-10 pb-28">
          <h2 className="text-xl font-bold mb-2">{t('contact-form-heading')}</h2>
          <p className="text-muted-foreground mb-6 text-sm">{t('contact-form-subheading')}</p>
          <ContactForm variant="nav" />
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/20" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
