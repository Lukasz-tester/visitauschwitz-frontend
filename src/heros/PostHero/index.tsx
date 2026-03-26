import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { useTranslations } from 'next-intl'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, meta: { image: metaImage } = {}, populatedAuthors, publishedAt, title } = post
  const t = useTranslations()

  return (
    <div className="container lg:flex lg:flex-row lg:gap-16">
      {metaImage && typeof metaImage !== 'string' && (
        <div className=" max-w-[50rem] pb-7 sm:pb-10 lg:pb-0 lg:pt-8">
          <Media imgClassName="w-full h-auto rounded-md" resource={metaImage} priority />
        </div>
      )}
      <div
        className="-mt-[10.4rem] pt-40"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className=" max-w-[50rem] text-foreground/80">
          <h1 className="font-heading text-4xl sm:text-5xl lg:pt-8 xl:pt-24">{title}</h1>
          <div className="flex flex-row lg:flex-col gap-6 md:gap-16 lg:gap-2 mt-5 opacity-70">
            {publishedAt && (
              <div className="flex flex-col lg:flex-row gap-1">
                <p className="text-sm lg:text-base">{t('date-published')}:</p>

                <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
              </div>
            )}
            <div className="flex flex-col  gap-4">
              {populatedAuthors && (
                <div className="flex flex-col lg:flex-row gap-1">
                  <p className="text-sm lg:text-base">{t('author')}:</p>
                  {populatedAuthors.map((author, index) => {
                    const { name } = author

                    const isLast = index === populatedAuthors.length - 1
                    const secondToLast = index === populatedAuthors.length - 2

                    return (
                      <React.Fragment key={index}>
                        {name}
                        {secondToLast && populatedAuthors.length > 2 && (
                          <React.Fragment>, </React.Fragment>
                        )}
                        {secondToLast && populatedAuthors.length === 2 && (
                          <React.Fragment> </React.Fragment>
                        )}
                        {!isLast && populatedAuthors.length > 1 && (
                          <React.Fragment>and </React.Fragment>
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="uppercase text-sm text-amber-700 flex flex-row lg:pt-1">
              {categories?.map((category, index) => {
                if (typeof category === 'object' && category !== null) {
                  const { title: categoryTitle } = category

                  const titleToUse = categoryTitle || 'Untitled category'

                  const isLast = index === categories.length - 1

                  return (
                    <React.Fragment key={index}>
                      {titleToUse}
                      {!isLast && <React.Fragment>, </React.Fragment>}
                    </React.Fragment>
                  )
                }
                return null
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
