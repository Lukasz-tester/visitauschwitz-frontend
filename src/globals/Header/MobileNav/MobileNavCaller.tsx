import LocaleSwitcher from '../LocaleSwitcher'
import type { Header as HeaderType } from '@/payload-types'
import NavItems from '../NavItems'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Search } from 'lucide-react'
import { DonationCard } from '@/components/DonationCard'

import { useEffect } from 'react'
import { Link, usePathname } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { useLockBodyScroll } from '@/utilities/helpers'
import { LogoLink } from '@/components/ui/logoLink'

export const MobileNavCaller: React.FC<{
  header: HeaderType
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
}> = ({ header, modalOpen, setModalOpen }) => {
  const pathname = usePathname()
  const t = useTranslations()
  useLockBodyScroll(modalOpen)

  // Close mobile nav on route change
  useEffect(() => {
    setModalOpen(false)
  }, [pathname, setModalOpen])

  useEffect(() => {
    document.documentElement.dataset.mobileNav = modalOpen ? 'open' : ''
  }, [modalOpen])

  useEffect(() => {
    const close = () => setModalOpen(false)
    window.addEventListener('close-mobile-nav', close)
    return () => window.removeEventListener('close-mobile-nav', close)
  }, [setModalOpen])

  return (
    <div>
      <button
        className={`z-30 top-0 right-0 ease-in-out duration-1000 ${modalOpen ? 'w-16 h-16 opacity-85 hover:opacity-100 transition-opacity' : 'bg-background/70 md:hover:bg-card-foreground lg:bottom-0 right-0 rounded-bl-3xl w-16 h-16'} flex items-center justify-center fixed dark:text-white/80 text-3xl`}
        onClick={() => setModalOpen(!modalOpen)}
        aria-label={t('open-navigation')}
      >
        <div
          className={`ease-in-out duration-1000 ${modalOpen ? 'rotate-45 translate-x-2' : 'pb-1'}`}
        >
          |
        </div>
        <div className={`ease-in-out duration-1000 ${modalOpen ? 'opacity-0' : ''}`}>|</div>
        <div
          className={`ease-in-out duration-1000 ${modalOpen ? '-rotate-45 -translate-x-2' : 'pt-1'}`}
        >
          |
        </div>
      </button>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 w-full z-20 transition-opacity duration-300 ease-in-out ${modalOpen ? 'bg-black/40 opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setModalOpen(false)}
      >
        <div
          className={`pt-2 h-screen flex flex-col max-w-[500px] sm:max-w-[350px] absolute right-0 bg-card md:bg-card/95 transition-transform duration-300 ease-in-out ${modalOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-end gap-1 text-xl pr-16 pt-1">
            <div aria-label={t('select-language')}>
              <LocaleSwitcher />
            </div>
            <Link
              href="/search/"
              aria-label={t('search')}
              className="p-3 opacity-85 hover:opacity-100 transition-opacity"
              onClick={() => setModalOpen(false)}
            >
              <Search size={22} />
            </Link>
            <div aria-label={t('change-theme')}>
              <ThemeSelector />
            </div>
          </div>
          <div className="flex flex-col my-8 py-2 pr-36">
            <div
              className="pl-2 pb-4 opacity-80 hover:opacity-90"
              onClick={() => setModalOpen(false)}
            >
              <LogoLink />{' '}
            </div>
            <NavItems
              header={header}
              onClick={() => setModalOpen(false)}
              aria-label={t('main-navigation')}
            />
          </div>
          <div className="absolute bottom-24 px-4">
            <DonationCard onClick={() => setModalOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileNavCaller
