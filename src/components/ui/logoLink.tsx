import { useTranslations } from 'next-intl'
import { Logo } from '@/components/ui/Icons'
// import { Link } from '@/i18n/routing'
import { CMSLink } from '../Link'
// import Link from 'next/link'
// import NextLink, { type LinkProps as NextLinkProps } from 'next/link'

export const LogoLink = ({ className }: { className?: string }) => {
  const t = useTranslations()
  const label = t('go-home')

  return (
    <CMSLink url="/" aria-label={label} className={className}>
      <Logo title={label} />
    </CMSLink>
  )
}
