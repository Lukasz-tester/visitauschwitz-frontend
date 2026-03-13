import { useState } from 'react'
import { useLocale } from 'next-intl'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function useNewsletterSubmit() {
  const [status, setStatus] = useState<Status>('idle')
  const locale = useLocale()

  const subscribe = async (email: string) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale, _hp_company: '' }),
      })
      if (!res.ok) throw new Error()
      localStorage.setItem('newsletter-subscribed', 'true')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return { status, subscribe }
}
