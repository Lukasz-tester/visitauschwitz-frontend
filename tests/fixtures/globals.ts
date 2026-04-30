import type { Header, Footer } from '@/payload-types'

export const headerFixture: Partial<Header> = {
  navItems: [
    { link: { type: 'custom', label: 'Home', url: '/' } as any },
    { link: { type: 'custom', label: 'Posts', url: '/posts' } as any },
  ] as any,
}

export const footerFixture: Partial<Footer> = {
  navItems: [{ link: { type: 'custom', label: 'Privacy', url: '/privacy' } as any }] as any,
}

export const redirectsResponse = {
  docs: [
    {
      id: 'redirect-1',
      from: '/old-path',
      to: { url: '/new-path' },
    },
  ],
}
