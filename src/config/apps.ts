// Static metadata for Łukasz's mobile apps, promoted on this website.
//
// Localized copy (name, tagline, description, features) lives in the next-intl
// message files under the `appPromo.<key>` namespace, so each app is translated
// ONCE and a new app is added by appending one entry here + its messages —
// without re-translating the rest of the site. See src/components/AppPromo.

export type AppKey = 'guidebook' | 'history'
export type AppStatus = 'comingSoon' | 'live'

export interface AppMeta {
  key: AppKey
  status: AppStatus
  /** App Store URL — null until the app is published. */
  iosUrl: string | null
  /** Google Play URL — null until the app is published. */
  androidUrl: string | null
  /** Landing route for this app on this site (locale prefix added by next-intl Link). */
  href: string
}

export const APPS: Record<AppKey, AppMeta> = {
  guidebook: {
    key: 'guidebook',
    status: 'comingSoon',
    iosUrl: null,
    androidUrl: null,
    href: '/guidebook-app',
  },
  // Second app (educational / history) — in progress. Flip status + add store
  // URLs when it ships; add a /history-app landing page mirroring guidebook.
  history: {
    key: 'history',
    status: 'comingSoon',
    iosUrl: null,
    androidUrl: null,
    href: '/history-app',
  },
}
