import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// next/navigation is referenced (transitively) by next-intl. Provide a
// minimal mock so component tests don't blow up on module resolution.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// next-intl's createNavigation reaches into next/navigation via a path that
// fails to resolve in the jsdom environment. Mock @/i18n/routing directly so
// callers get plain links and noop hooks instead.
import * as React from 'react'
vi.mock('@/i18n/routing', () => ({
  routing: { locales: ['en', 'pl'], defaultLocale: 'en' },
  Link: ({ href, children, ...rest }: any) =>
    React.createElement('a', { href: typeof href === 'string' ? href : '#', ...rest }, children),
  redirect: vi.fn(),
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}))

afterEach(() => {
  cleanup()
})
