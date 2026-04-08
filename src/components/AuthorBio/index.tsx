import React from 'react'

import type { Post, Media } from '@/payload-types'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight } from 'lucide-react'

const LUKASZ_ID = '675f51ab4d074485ad8b59af'

type PopulatedAuthor = NonNullable<Post['populatedAuthors']>[number]

type Props = {
  authors: PopulatedAuthor[]
}

export const AuthorBio: React.FC<Props> = ({ authors }) => {
  const t = useTranslations()
  if (authors.length === 0) return null

  return (
    <div className="container max-w-[50rem]">
      <Link
        href="/posts"
        className="flex pt-9 text-sm uppercase tracking-widest text-foreground/70 font-medium hover:text-foreground transition-colors"
      >
        {t('read-more-articles')}
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* <div className="border-t border-border mb-10" /> */}
      <div className="flex flex-col gap-10 my-8">
        {authors.map((author) => {
          const photo =
            author.photo && typeof author.photo === 'object' ? (author.photo as Media) : null
          const photoUrl = photo?.filename
            ? `https://images.visitauschwitz.info/${photo.filename}`
            : null

          const isLukasz = author.id === LUKASZ_ID
          const cardClassName = `flex flex-col sm:flex-row gap-8 items-start
                         rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-sm
                         shadow-sm${isLukasz ? ' no-underline text-inherit transition-colors hover:border-primary/50' : ''}`

          const cardContent = (
            <>
              {photoUrl && (
                <div className="shrink-0 place-self-center">
                  <img
                    src={photoUrl}
                    alt={photo?.alt ?? author.name ?? 'Author photo'}
                    className="sm:w-64 h-44 rounded-xl object-cover ring-1 ring-border shadow-md"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-widest text-foreground/50 font-medium">
                  {t('about-author')}
                </p>
                {author.name && (
                  <h2 className="text-lg font-semibold leading-tight">{author.name}</h2>
                )}
                {author.bio && (
                  <p className="text-sm leading-relaxed text-foreground/70">{author.bio}</p>
                )}
              </div>
            </>
          )

          return isLukasz ? (
            <Link key={author.id} href="/#about-me" className={cardClassName}>
              {cardContent}
            </Link>
          ) : (
            <div key={author.id} className={cardClassName}>
              {cardContent}
            </div>
          )
        })}
      </div>
    </div>
  )
}
