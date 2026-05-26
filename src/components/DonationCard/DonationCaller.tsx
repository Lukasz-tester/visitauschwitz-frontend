'use client'

import { DonationCard } from './index'
import { cn } from '@/utilities/cn'

type Props = {
  setMobileNavOpen: (open: boolean) => void
}

export function DonationCaller({ setMobileNavOpen }: Props) {
  return (
    <div
      className={cn(
        'fixed bottom-16 right-1 w-full max-w-[325px] z-[45]',
        'transition-transform duration-300 ease-in-out',
        'translate-x-full pointer-events-none',
        '[[data-mobile-nav=open]_&]:translate-x-0',
        '[[data-mobile-nav=open]_&]:pointer-events-auto',
      )}
    >
      <DonationCard onClick={() => setMobileNavOpen(false)} />
    </div>
  )
}

export default DonationCaller
