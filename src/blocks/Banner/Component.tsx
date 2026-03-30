import type { BannerBlock as BannerBlockProps } from 'src/payload-types'
import React from 'react'
import RichText from '@/components/RichText'

type Props = {
  className?: string
} & BannerBlockProps

export const TextBlock: React.FC<Props> = ({ className, blockName, content, style }) => {
  return (
    <>
      {style === 'text' && (
        <div id={blockName || undefined}>
          <RichText className="my-6" content={content} enableGutter={false} />
        </div>
      )}
      {style === 'quote' && (
        <div className="py-8 lg:py-2">
          <div className="py-4 flex rounded bg-card-foreground">
            <div className="text-6xl md:text-7xl font-serif ml-5 md:ml-7 mr-3">&ldquo;</div>
            <div>
              <RichText content={content} className="px-3" />
            </div>
          </div>
        </div>
      )}
      {style === 'emphasis' && (
        <div className="rounded border p-4 pb-5 my-5 bg-card">
          <div>
            <RichText
              className="text-[21px] opacity-90 place-self-center prose-a:underline font-normal prose-a:font-semibold prose-a:decoration-amber-700/80 hover:prose-a:text-white/90 dark:hover:prose-a:bg-amber-700/80 hover:prose-a:bg-amber-700/90"
              enableProse={false}
              enableGutter={false}
              content={content}
            />
          </div>
        </div>
      )}
    </>
  )
}
