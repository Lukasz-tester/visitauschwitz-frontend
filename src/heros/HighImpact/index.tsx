import React from 'react'

import type { Page } from '@/payload-types'
import RichText from '@/components/RichText'
import { ImageMedia } from '@/components/Media/ImageMedia'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const HighImpactHero: React.FC<Page['hero']> = React.memo(({ links, media, richText }) => {
  return (
    <div
      className="relative -mt-[10.4rem] flex items-end text-white min-h-screen pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      style={{
        backgroundImage: 'url(/images/default-hero.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container mb-8 z-10 relative">
        <div className="max-w-2xl">
          {richText && (
            <RichText
              className="mb-4 mt-28 p-5 rounded-xl prose-headings:font-normal prose-p:font-sans 
              md:prose-p:text-2xl prose-p:pt-2 font-heading prose-h1:text-4xl sm:prose-h1:text-5xl lg:prose-h1:text-6xl opacity-85
              bg-gradient-to-tr from-slate-500 from-5% via-slate-800 via-40% to-75%"
              content={richText}
              enableGutter={false}
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap pl-2 md:pl-4 gap-4 mb-3">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <Button asChild variant={link.appearance}>
                      <Link href={link.url || '#'}>{link.label}</Link>
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      {media && typeof media === 'object' && (
        <div className="absolute inset-0">
          <ImageMedia
            fill
            imgClassName=" object-cover select-none"
            priority
            resource={media}
            size="100vw"
          />
          <div
            className="absolute pointer-events-none left-0 bottom-0 w-full h-full
               bg-gradient-to-b from-5% from-background via-30% via-transparent dark:via-transparent dark:to-background select-none"
          />
        </div>
      )}
    </div>
  )
})

HighImpactHero.displayName = 'HighImpactHero'
