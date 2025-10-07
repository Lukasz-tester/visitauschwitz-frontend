'use client' //just for logging

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from 'src/utilities/cn'
import { useLocale } from 'next-intl'
import React from 'react'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'

import type { Page, Post } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
  onClick?(): void
}

// Use Next.js LinkProps directly
type LinkProps = Omit<NextLinkProps, 'href'> & { href: string }

export const CMSLink: React.FC<CMSLinkType> = ({
  type,
  appearance = 'inline',
  children,
  className,
  label,
  newTab,
  reference,
  size: sizeFromProps,
  url,
  onClick,
}) => {
  const locale = useLocale()

  // Resolve href from reference or custom URL
  let href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${reference.value.slug}`
      : url || ''

  if (!href) return null

  if (!href.startsWith(`/${locale}`)) {
    href = `/${locale}${href.startsWith('/') ? href : `/${href}`}`
  }

  // Normalize to ensure it always starts with "/"
  if (!href.startsWith('/')) {
    href = `/${href}`
  }

  // Add locale prefix if missing and it's an internal link
  const isInternal =
    href.startsWith('/') &&
    !href.startsWith('/_next') &&
    !href.startsWith('/admin') &&
    !href.includes('://')

  if (isInternal && !href.startsWith(`/${locale}/`) && href !== `/${locale}`) {
    href = `/${locale}${href}`
  }

  console.log(`[CMSLink] locale=${locale}, href=${href}`)

  // // 🧠 Auto-prefix locale if missing
  // if (
  //   href.startsWith('/') &&
  //   !href.startsWith(`/${locale}`) &&
  //   !href.startsWith('/admin') &&
  //   !href.startsWith('/_next') &&
  //   !href.includes('://')
  // ) {
  //   href = `/${locale}${href}`
  // }

  // // ⚡ Append `.html` if doing a static export
  // if (process.env.NEXT_EXPORT && !href.endsWith('.html') && !href.includes('#')) {
  //   href += '.html'
  // }

  const linkProps: LinkProps = {
    href,
    locale, // let Next.js handle locale automatically in dev
    ...((newTab && { target: '_blank', rel: 'noopener noreferrer' }) || {}),
    onClick,
  }

  const size = appearance === 'link' ? 'clear' : sizeFromProps

  if (appearance === 'inline') {
    return (
      <NextLink className={cn(className)} {...linkProps}>
        {label}
        {children}
      </NextLink>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <NextLink className={cn(className)} {...linkProps}>
        {label}
        {children}
      </NextLink>
    </Button>
  )
}

// import { Button, type ButtonProps } from '@/components/ui/button'
// import { cn } from 'src/utilities/cn'
// import { useLocale } from 'next-intl'
// import React from 'react'
// import NextLink, { type LinkProps as NextLinkProps } from 'next/link'

// import type { Page, Post } from '@/payload-types'

// type CMSLinkType = {
//   appearance?: 'inline' | ButtonProps['variant']
//   children?: React.ReactNode
//   className?: string
//   label?: string | null
//   newTab?: boolean | null
//   reference?: {
//     relationTo: 'pages' | 'posts'
//     value: Page | Post | string | number
//   } | null
//   size?: ButtonProps['size'] | null
//   type?: 'custom' | 'reference' | null
//   url?: string | null
//   onClick?(): void
// }

// // Use Next.js' LinkProps directly
// type LinkProps = Omit<NextLinkProps, 'href'> & { href: string }

// export const CMSLink: React.FC<CMSLinkType> = ({
//   type,
//   appearance = 'inline',
//   children,
//   className,
//   label,
//   newTab,
//   reference,
//   size: sizeFromProps,
//   url,
//   onClick,
// }) => {
//   const locale = useLocale()

//   // Resolve href from reference or custom URL
//   let href =
//     type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
//       ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${reference.value.slug}`
//       : url || ''

//   if (!href) return null

//   const linkProps: LinkProps = {
//     href,
//     locale, // <-- let Next.js handle locale automatically
//     ...((newTab && { target: '_blank', rel: 'noopener noreferrer' }) || {}),
//     onClick,
//   }

//   const size = appearance === 'link' ? 'clear' : sizeFromProps

//   if (appearance === 'inline') {
//     return (
//       <NextLink className={cn(className)} {...linkProps}>
//         {label}
//         {children}
//       </NextLink>
//     )
//   }

//   return (
//     <Button asChild className={className} size={size} variant={appearance}>
//       <NextLink className={cn(className)} {...linkProps}>
//         {label}
//         {children}
//       </NextLink>
//     </Button>
//   )
// }
