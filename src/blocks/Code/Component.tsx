import React from 'react'
import RichText from '@/components/RichText'
import { ImageMedia } from '@/components/Media/ImageMedia'

export type ImageBlockProps = {
  caption: Record<string, any>
  blockType: 'Image'
  media?: any
}

type Props = ImageBlockProps & {
  className?: string
}

export const ImageBlock: React.FC<Props> = ({ media, caption }) => {
  return (
    <div className="mb-10 pt-5 place-self-center">
      <ImageMedia imgClassName="rounded mb-3" resource={media} />
      <div className="self-end items-end right-0">
        <RichText
          className="not-prose text-md text-gray-500 dark:text-gray-400"
          content={caption}
          enableProse={false}
          enableGutter={false}
        />
      </div>
    </div>
  )
}
