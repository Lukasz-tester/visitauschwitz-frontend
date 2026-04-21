import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { ImageMedia } from '@/components/Media/ImageMedia'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'

export const MediumImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="container lg:flex lg:flex-row lg:gap-16">
      {/* Left Column - Image */}
      <div className="lg:w-1/2 pb-8 lg:pb-0">
        <div className="relative rounded-xl overflow-hidden">
          {media && typeof media === 'object' && (
            <ImageMedia
              imgClassName="w-full h-auto object-cover"
              resource={media}
              priority
            />
          )}
          {/* Optional gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Right Column - Content */}
      <div className="lg:w-1/2 flex flex-col justify-center">
        {richText && (
          <RichText
            className="mb-6 prose-headings:font-normal prose-p:font-sans
                       md:prose-p:text-xl prose-p:pt-2 font-heading
                       prose-h1:text-4xl md:prose-h1:text-5xl opacity-85"
            content={richText}
            enableGutter={false}
          />
        )}
        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {links.map(({ link }, i) => {
              // Map old hero appearances to new medium mode variants
              const variant = link.appearance === 'default' ? 'medium' :
                            link.appearance === 'outline' ? 'mediumOutline' :
                            link.appearance
              return (
                <li key={i}>
                  <Button asChild variant={variant}>
                    <CMSLink {...link} />
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
