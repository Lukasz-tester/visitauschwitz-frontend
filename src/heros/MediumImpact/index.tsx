import React from 'react'

import type { Page } from '@/payload-types'

import Link from 'next/link'
import { ImageMedia } from '@/components/Media/ImageMedia'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="container ">
      {richText && (
        <RichText
          className="mb-8 lg:mb-16 prose prose-headings:font-normal prose-p:hidden font-heading
                       prose-h1:text-4xl md:prose-h1:text-5xl opacity-85"
          content={richText}
          enableGutter={false}
        />
      )}
      <div className="lg:flex lg:flex-row lg:gap-16 pb-16">
        {/* Left - Image */}
        <div className="lg:w-1/2">
          <div className="relative rounded-xl overflow-hidden">
            {media && typeof media === 'object' && (
              <ImageMedia imgClassName="w-full h-auto object-cover" resource={media} priority />
            )}
          </div>
        </div>
        {/* Column - Content */}
        <div className="lg:w-1/2 flex flex-col mb-12">
          {richText && (
            <RichText
              className="mb-6 mt-0 prose-headings:hidden prose-p:font-sans
                       md:prose-p:text-xl opacity-85"
              content={richText}
              enableGutter={false}
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap gap-4">
              {links.map(({ link }, i) => {
                // Map old hero appearances to new medium mode variants
                const variant =
                  link.appearance === 'default'
                    ? 'medium'
                    : link.appearance === 'outline'
                      ? 'mediumOutline'
                      : link.appearance
                return (
                  <li key={i}>
                    <Button asChild variant={variant}>
                      <Link href={link.url || '#'}>{link.label}</Link>
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
