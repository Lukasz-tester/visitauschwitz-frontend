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
        'hidden [[data-mobile-nav=open]_&]:block',
        'fixed bottom-16 right-0 w-full max-w-[500px] sm:max-w-[350px] z-30',
      )}
    >
      <DonationCard onClick={() => setMobileNavOpen(false)} />
    </div>
  )
}

export default DonationCaller
