import React, { Fragment } from 'react'
import type { Page, TypedLocale } from '@/payload-types'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component.client'
import { OpeningHoursBlock } from './OpeningHours/Component.client'
import { AccordionBlock } from './Accordion/Component.client'
import { CodeBlock } from './Code/Component'
import { BannerBlock } from './Banner/Component'

const blockComponents: Record<string, React.FC<{ locale: TypedLocale } & any>> = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  Image: CodeBlock,
  Text: BannerBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  oh: OpeningHoursBlock,
  accordion: AccordionBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  locale: TypedLocale
  url: string
}> = ({ blocks, locale, url }) => {
  if (!blocks || blocks.length === 0) return null

  return (
    <Fragment>
      {blocks.map((block, index) => {
        const { blockType } = block

        if (blockType && blockType in blockComponents) {
          const Block = blockComponents[blockType]
          return (
            <div key={index}>
              <Block {...block} locale={locale} fullUrl={url} />
            </div>
          )
        }
        return null
      })}
    </Fragment>
  )
}
