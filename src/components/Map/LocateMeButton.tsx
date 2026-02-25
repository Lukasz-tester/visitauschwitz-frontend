'use client'

import { LocateIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useTranslations } from 'next-intl'

export function LocateMeButton() {
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState<[number, number] | null>(null)
  const map = useMap()
  const t = useTranslations()

  // Custom Geolocation Icon
  const geolocationIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/622/622669.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })

  const handleClick = () => {
    setLoading(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setPosition([latitude, longitude])
          map.setView([latitude, longitude], map.getZoom())
          setLoading(false)
        },
        () => {
          alert(t('map-locate-error'))
          setLoading(false)
        },
      )
    } else {
      alert(t('map-locate-unsupported'))
      setLoading(false)
    }
  }

  useEffect(() => {
    if (position) {
      const marker = L.marker(position, { icon: geolocationIcon })
      marker.addTo(map).bindPopup(t('map-locate-popup'))

      return () => {
        map.removeLayer(marker)
      }
    }
  }, [position, map])

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-card bottom-20 right-0 w-14 h-14 rounded-s-3xl flex items-center justify-center fixed z-[10001] dark:text-white/80"
      >
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <LocateIcon strokeWidth={1} size={32} />
        )}
      </button>

      <style jsx>{`
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}
