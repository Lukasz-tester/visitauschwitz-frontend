import React, { Fragment } from 'react'
import type { Page, TypedLocale } from '@/payload-types'
import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component.client'
import { OpeningHoursBlock } from './OpeningHours/Component.client'
import { AccordionBlock } from './Accordion/Component.client'
import { ImageBlock } from './Code/Component'
import { TextBlock } from './Banner/Component'
import { BlockErrorBoundary } from './BlockErrorBoundary'

const blockComponents: Record<string, React.FC<{ locale: TypedLocale } & any>> = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  Image: ImageBlock,
  Text: TextBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  oh: OpeningHoursBlock,
  accordion: AccordionBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  locale: TypedLocale
  url: string
  insertBeforeLast?: React.ReactNode
}> = ({ blocks, locale, url, insertBeforeLast }) => {
  if (!blocks || blocks.length === 0) return null

  const insertIndex = blocks.length - 2

  return (
    <Fragment>
      {blocks.map((block, index) => {
        const { blockType } = block

        if (blockType && blockType in blockComponents) {
          const Block = blockComponents[blockType]
          return (
            <Fragment key={index}>
              {index === insertIndex && insertBeforeLast}
              <BlockErrorBoundary blockType={blockType}>
                <div>
                  <Block {...block} locale={locale} fullUrl={url} />
                </div>
              </BlockErrorBoundary>
            </Fragment>
          )
        }
        return null
      })}
    </Fragment>
  )
}
