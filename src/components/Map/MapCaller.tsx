'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useScrolledFromTop, useLockBodyScroll } from '@/utilities/helpers'
import { MapPlaceholder } from '../ui/Icons'
import { X } from 'lucide-react'
import { useMapModal } from '@/providers/MapModalContext'

const LazyMap = dynamic(() => import('./mapModal'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
})

type MapCallerProps = {
  setMobileNavOpen: (open: boolean) => void
}

function MapCaller({ setMobileNavOpen }: MapCallerProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const { currentUrl, setCurrentUrl } = useMapModal()

  useLockBodyScroll(modalOpen)

  useEffect(() => {
    document.documentElement.toggleAttribute('data-map-open', modalOpen)
    return () => document.documentElement.removeAttribute('data-map-open')
  }, [modalOpen])

  useEffect(() => {
    // Close the modal if currentUrl is null and modalOpen is true
    if (currentUrl === null && modalOpen) {
      setModalOpen(false)
    }
  }, [currentUrl, modalOpen])

  useEffect(() => {
    if (!modalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurrentUrl(null)
        setModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalOpen, setCurrentUrl])

  const handleToggle = () => {
    if (!modalOpen) {
      // Open modal and set currentUrl
      setCurrentUrl('/map') // Use any non-null string
      setModalOpen(true)
      setHasOpened(true)
      setMobileNavOpen(false)
    } else {
      // Close modal and reset currentUrl
      setCurrentUrl(null)
      setModalOpen(false)
    }
  }

  return (
    <div className={`z-50 fixed ${useScrolledFromTop() ? '' : 'hidden sm:block'}`}>
      <button
        className={`z-50 ease-in-out duration-500 fixed flex items-center justify-center font-thin dark:text-white/80 text-black/70 ${
          modalOpen
            ? 'bg-card bottom-4 right-0 w-14 h-14 rounded-s-full'
            : 'bottom-3 right-5 w-14 h-14 rounded-full shadow-lg bg-background/80 md:hover:bg-card-foreground'
        }`}
        onClick={handleToggle}
      >
        {/* X Icon visibility logic */}
        <div
          className={`absolute transition-opacity ease-in-out duration-500 ${modalOpen ? 'opacity-100' : 'opacity-0'}`}
        >
          <X strokeWidth={1} size={modalOpen ? 32 : 28} />
        </div>

        {/* Map Icon visibility logic */}
        <div
          className={`transition-opacity ease-in-out duration-500 flex flex-col items-center -mt-1 ${modalOpen ? 'opacity-0' : 'opacity-100'}`}
        >
          <MapPlaceholder />
        </div>
      </button>
      {/* MAP label - only visible when mobile nav is open */}
      {!modalOpen && (
        <span className="hidden [[data-mobile-nav=open]_&]:block fixed bottom-1 right-5 w-14 text-center text-[10px] font-semibold dark:text-white/80 text-black/70 z-50">
          MAP
        </span>
      )}

      {/* Modal - stays mounted after first open to preserve map state */}
      {hasOpened && (
        <div
          className={`fixed inset-0 ${modalOpen && currentUrl ? '' : 'invisible pointer-events-none'}`}
        >
          <LazyMap />
        </div>
      )}
    </div>
  )
}

export default MapCaller
