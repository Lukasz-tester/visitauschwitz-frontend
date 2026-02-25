import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'
import type { TypedLocale } from '@/payload-types'

import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
    locale: TypedLocale
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    locale,
  } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const categoryParam =
      flattenedCategories && flattenedCategories.length > 0
        ? `&where[categories][in]=${flattenedCategories.join(',')}`
        : ''

    try {
      const res = await fetch(
        `${process.env.CMS_PUBLIC_SERVER_URL}/api/posts?limit=${limit}&locale=${locale}&depth=1${categoryParam}`,
        { next: { revalidate: false } },
      )
      if (res.ok) {
        const data = await res.json()
        posts = data?.docs ?? []
      }
    } catch {
      // CMS unavailable, posts will remain empty
    }
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className={`container ${introContent.root.direction === null ? 'hidden' : 'mb-16'}`}>
          <RichText className="ml-0 max-w-[48rem]" content={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
