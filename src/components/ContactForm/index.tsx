'use client'

import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocale, useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { cn } from '@/utilities/cn'

type Variant = 'nav' | 'homepage'

interface FormValues {
  email: string
  message: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm({ variant }: { variant: Variant }) {
  const t = useTranslations()
  const locale = useLocale()
  const honeypotRef = useRef<HTMLInputElement>(null)
  const lastSubmitRef = useRef(0)
  const [status, setStatus] = useState<Status>('idle')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: '', message: '' } })

  const onSubmit = async (data: FormValues) => {
    if (honeypotRef.current?.value) return

    const now = Date.now()
    if (now - lastSubmitRef.current < 10_000) return
    lastSubmitRef.current = now

    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          message: data.message,
          name: 'Website visitor',
          locale,
          _hp_company: '',
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col gap-2">
        <p
          className={cn(
            'font-medium',
            variant === 'nav' ? 'text-green-600 dark:text-green-400' : 'text-green-600',
          )}
        >
          {t('contact-success')}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('contact-success-newsletter')}{' '}
          <Link href="/newsletter/" className="underline hover:text-primary">
            {t('newsletter-learn-more')}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Honeypot */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}
      >
        <input type="text" autoComplete="off" tabIndex={-1} ref={honeypotRef} />
      </div>

      <div className="flex flex-col gap-1">
        <Input
          type="email"
          placeholder={t('contact-email-placeholder')}
          className={variant === 'nav' ? 'bg-background' : 'bg-card'}
          {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{t('contact-email-error')}</p>}
      </div>

      <div className="flex flex-col gap-1 pb-3">
        <textarea
          placeholder={t('contact-message-placeholder')}
          rows={variant === 'nav' ? 3 : 4}
          className={cn(
            'flex w-full rounded border border-border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
            variant === 'nav' ? 'bg-background' : 'bg-card',
          )}
          {...register('message', { required: true, minLength: 3 })}
        />
        {errors.message && (
          <p className="text-red-500 text-sm mt-1">{t('contact-message-error')}</p>
        )}
      </div>

      {status === 'error' && <p className="text-red-500 text-sm">{t('contact-error')}</p>}

      <Button
        type="submit"
        disabled={status === 'loading'}
        variant="default"
        className="shrink-0 w-fit"
      >
        {t('contact-send')}
      </Button>
    </form>
  )
}

export const ContactFormMemo = React.memo(ContactForm)
