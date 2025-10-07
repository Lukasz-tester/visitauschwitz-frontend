// 'use client' //just for logging

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from 'src/utilities/cn'
import { useLocale } from 'next-intl'
import React from 'react'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import Link from 'next/link'
// import { usePathname } from 'next/navigation'

import type { Page, Post } from '@/payload-types'
// import { Link } from '@/i18n/routing'

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

  // EXTERNAL LINKING
  if (href.startsWith('http')) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" replace>
        {label}
        {children}
      </Link>
    )
  }

  // inside your CMSLink component
  // const pathname = usePathname()

  // INTERNAL LINKING - THE SAME PAGE
  if (href.startsWith('#')) {
    // const fullHref = `${pathname}${href}` // combine current path with hash
    return (
      //fullHref below instead of href
      <Link href={href} className={cn(className)}>
        {label}
        {children}
      </Link>
    )
  }

  // 2️⃣ Normalize href to always start with "/"
  if (!href.startsWith('/')) {
    href = `/${href}`
  }

  // 3️⃣ Detect internal links (should be prefixed)
  const isInternal =
    href.startsWith('/') &&
    !href.startsWith('/_next') &&
    !href.startsWith('/admin') &&
    !href.startsWith(`/${locale}`) &&
    !href.includes('://')
  // !href.startsWith('#')

  // 4️⃣ Prefix locale only for internal links
  if (isInternal) {
    href = `/${locale}${href}`
  }

  console.log(`[CMSLink] locale=${locale}, href=${href}`)

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
