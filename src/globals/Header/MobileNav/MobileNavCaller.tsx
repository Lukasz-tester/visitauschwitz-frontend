import LocaleSwitcher from '../LocaleSwitcher'

import { SearchIcon } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'
import NavItems from '../NavItems'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'

import { useTranslations } from 'next-intl'
import { useLockBodyScroll } from '@/utilities/helpers'
import { LogoLink } from '@/components/ui/logoLink'
import { CMSLink } from '@/components/Link'
import { NewsletterSignup } from '@/components/NewsletterSignup'

export const MobileNavCaller: React.FC<{
  header: HeaderType
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
}> = ({ header, modalOpen, setModalOpen }) => {
  const t = useTranslations()
  useLockBodyScroll(modalOpen)

  // const links = {
  //   supplement: 'tips',
  //   '/posts': 'posts',
  //   '/#about-me': 'about',
  //   '/contact': 'contact',
  //   // TODO - odkomentuj ponizej i dodaj odpowiedni link jak bedzie
  //   // '/': 'books',
  // }

  return (
    <div>
      <button
        className={`z-30 top-0 right-0 ease-in-out duration-1000 ${modalOpen ? 'w-16 h-16' : 'bg-background/70 md:hover:bg-card-foreground lg:bottom-0 right-0 rounded-bl-3xl w-16 h-16'} flex items-center justify-center fixed dark:text-white/80 text-3xl`}
        onClick={() => setModalOpen(!modalOpen)}
        aria-label="Open Navigation"
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
      {modalOpen && (
        <div className="fixed inset-0 w-full z-20 bg-black/40" onClick={() => setModalOpen(false)}>
          <div
            className="pt-2 h-screen flex flex-col max-w-[500px] sm:max-w-[350px] absolute right-0 bg-card md:bg-card/95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-end gap-1 text-xl pr-16 pt-1">
              <div aria-label="Select Language">
                <LocaleSwitcher />
              </div>
              <div aria-label="Change Theme">
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
                aria-label="Main Navigation"
              />
            </div>
            <div className="mt-auto pb-6 px-5 flex flex-col gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3 ml-1">
                  {t('newsletter-heading-short')}
                </p>
                <NewsletterSignup variant="mobilenav" />
              </div>
              {/* <div
                className="w-full flex flex-col text-xl text-slate-700 dark:text-slate-400 font-semibold"
                onClick={() => setModalOpen(false)}
              >
                <CMSLink
                  aria-label="Secondary Navigation"
                  key="/contact"
                  className="p-2 px-3 lg:text-2xl hover:text-amber-700/90"
                  onClick={() => setModalOpen(false)}
                  url="/contact"
                >
                  {t('contact')}
                </CMSLink>
                <CMSLink
                  aria-label="Secondary Navigation"
                  key="/posts"
                  className="p-2 px-3 lg:text-2xl hover:text-amber-700/90"
                  onClick={() => setModalOpen(false)}
                  url="/posts"
                >
                  {t('posts')}
                </CMSLink>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileNavCaller
