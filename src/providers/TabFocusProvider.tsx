'use client'
import { useEffect, useState } from 'react'

export const TabFocusProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Use pageshow event - only fires on bfcache restoration
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
        // Check if content is raw JSON (indicating the RSC issue)
        const isJsonContent = isPageJSON()

        if (isJsonContent) {
          console.warn('bfcache restoration detected with JSON content, reloading...')
          window.location.reload()
        }
      }
    }

    // Check if page content is raw JSON
    const isPageJSON = (): boolean => {
      try {
        const preElement = document.querySelector('pre')
        if (!preElement) return false

        const content = preElement.innerText?.trim()
        if (!content) return false

        JSON.parse(content)
        return true
      } catch {
        return false
      }
    }

    // Offline indicator handlers (no reload needed)
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('pageshow', handlePageShow)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial offline state
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <>
      {isOffline && (
        <div className="fixed bottom-4 left-4 bg-red-600 text-white p-2 rounded-lg shadow-lg z-50">
          You are offline
        </div>
      )}
      {children}
    </>
  )
}
