'use client'

import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Link } from '@/i18n/routing'
import { useNewsletterSubmit } from './useNewsletterSubmit'

type Variant = 'footer' | 'homepage' | 'popup' | 'mobilenav' | 'page'

interface FormValues {
  email: string
}

export function NewsletterSignup({ variant }: { variant: Variant }) {
  const t = useTranslations()
  const { status, subscribe } = useNewsletterSubmit()
  const honeypotRef = useRef<HTMLInputElement>(null)
  const [consent, setConsent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: '' } })

  const onSubmit = (data: FormValues) => {
    if (honeypotRef.current?.value) return
    subscribe(data.email)
  }

  if (status === 'success') {
    return (
      <p className={variant === 'footer' ? 'text-green-400' : 'text-green-600 font-medium'}>
        {t('newsletter-success')}
      </p>
    )
  }

  const isCompact = variant === 'footer' || variant === 'mobilenav'

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={isCompact ? 'flex flex-wrap gap-3 items-start' : 'flex flex-col gap-4'}
    >
      {variant === 'footer' && (
        <h3 className="text-white/80 text-2xl font-semibold mb-4">{t('newsletter-heading')}</h3>
      )}
      {variant === 'page' && (
        <h3 className="text-foreground/80 text-2xl md:text-3xl font-bold mb-4">
          {t('newsletter-heading')}
        </h3>
      )}
      {/* Honeypot */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}
      >
        <input type="text" autoComplete="off" tabIndex={-1} ref={honeypotRef} />
      </div>

      <div className="flex flex-col gap-1 w-full">
        <Input
          type="email"
          placeholder={t('newsletter-email-placeholder')}
          className={
            variant === 'footer'
              ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50'
              : isCompact
                ? 'bg-background'
                : variant === 'popup'
                  ? 'bg-background'
                  : 'bg-card'
          }
          {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">Please enter a valid email address.</p>
        )}
      </div>

      {status === 'error' && <p className="text-red-500 text-sm">{t('newsletter-error')}</p>}

      <div className={`pb-1 flex items-center gap-2 ${isCompact ? 'w-full' : ''}`}>
        <Checkbox
          id={`newsletter-consent-${variant}`}
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          className={`h-4 w-4 shrink-0 rounded border data-[state=checked]:text-primary-foreground ${variant === 'footer' ? 'border-white/40 data-[state=checked]:bg-white/30' : 'border-primary data-[state=checked]:bg-primary'}`}
        />
        <label
          htmlFor={`newsletter-consent-${variant}`}
          className={`text-xs cursor-pointer select-none ${variant === 'footer' ? 'text-white/40' : 'text-foreground/80'}`}
        >
          {t('consent-commercial')}
          <Link href="/privacy/" className="underline hover:text-primary">
            {t('privacy-policy')}
          </Link>
        </label>
      </div>

      <Button
        type="submit"
        disabled={status === 'loading' || !consent}
        variant={isCompact ? (variant === 'mobilenav' ? 'default' : 'outline') : 'default'}
        className="shrink-0 w-fit ml-5"
      >
        {isCompact ? t('newsletter-submit-footer') : t('newsletter-submit')}
      </Button>
    </form>
  )
}

export const NewsletterSignupMemo = React.memo(NewsletterSignup)
