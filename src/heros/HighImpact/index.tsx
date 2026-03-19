import React from 'react'

import type { Page } from '@/payload-types'
import { serializeLexical, type NodeTypes } from '@/components/RichText/serialize'
import { ImageMedia } from '@/components/Media/ImageMedia'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const HighImpactHero: React.FC<Page['hero']> = React.memo(({ links, media, richText }) => {
  const nodes = (richText?.root?.children ?? []) as NodeTypes[]
  const headingNode = nodes.find((n) => n.type === 'heading') as
    | (NodeTypes & { type: 'heading' })
    | undefined
  const subtitleNodes = nodes.filter((n) => n.type === 'paragraph') as (NodeTypes & {
    type: 'paragraph'
  })[]

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
            <div
              className="mb-4 mt-28 p-5 rounded-xl bg-gradient-to-tr
              from-slate-500 from-5% via-slate-800 via-40% to-75%"
            >
              <h1 className="font-heading md:text-5xl lg:text-[4.1rem] opacity-85">
                {headingNode && serializeLexical({ nodes: headingNode.children as NodeTypes[] })}
                {subtitleNodes.length > 0 && <span className="sr-only">{' - '}</span>}
                {subtitleNodes.map((pNode, i) => (
                  <span
                    key={i}
                    className="block font-sans text-base md:text-2xl font-normal pt-3 opacity-90"
                  >
                    {serializeLexical({ nodes: pNode.children as NodeTypes[] })}
                  </span>
                ))}
              </h1>
            </div>
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
