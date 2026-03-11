import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function useNewsletterSubmit() {
  const [status, setStatus] = useState<Status>('idle')

  const subscribe = async (email: string) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, _hp_company: '' }),
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
