# Performance Improvements - Pending Changes

These changes were prepared to improve INP and LCP metrics based on Cloudflare Web Analytics data. All changes have been reverted and documented here for later application.

## 1. Hero Image Preloading
**File:** `/Users/lucky/dev/visit-auschwitz-info/visitauschwitz-frontend/src/app/(frontend)/[locale]/layout.tsx`

**Change:** Add preload link for default hero image in the `<head>` section
```tsx
<link href="/images/default-hero.webp" rel="preload" as="image" />
```

**Location:** After the favicon link, before closing `</head>` tag

## 2. ImageMedia SessionStorage Optimization
**File:** `/Users/lucky/dev/visit-auschwitz-info/visitauschwitz-frontend/src/components/Media/ImageMedia/index.tsx`

**Changes:**
1. Add `useMemo` to imports: `import React, { useCallback, useEffect, useMemo, useState } from 'react'`
2. Cache the sessionStorage key with useMemo:
```tsx
const cacheCheckKey = useMemo(() => `img-loaded-${src}`, [src])
```
3. Replace all `img-loaded-${src}` with `cacheCheckKey` in both useEffect hooks
4. Add React.memo export at end of file:
```tsx
export const ImageMediaMemo = React.memo(ImageMedia)
```

## 3. React.memo on Accordion Component
**File:** `/Users/lucky/dev/visit-auschwitz-info/visitauschwitz-frontend/src/blocks/Accordion/Component.client.tsx`

**Changes:**
1. Add React to imports: `import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'`
2. Add React.memo export at end of file:
```tsx
export const AccordionBlockMemo = React.memo(AccordionBlock)
```

## 4. React.memo on NewsletterSignup Component
**File:** `/Users/lucky/dev/visit-auschwitz-info/visitauschwitz-frontend/src/components/NewsletterSignup/index.tsx`

**Change:** Add React.memo export at end of file:
```tsx
export const NewsletterSignupMemo = React.memo(NewsletterSignup)
```

## 5. React.memo on ContactForm Component
**File:** `/Users/lucky/dev/visit-auschwitz-info/visitauschwitz-frontend/src/components/ContactForm/index.tsx`

**Change:** Add React.memo export at end of file:
```tsx
export const ContactFormMemo = React.memo(ContactForm)
```

## 6. Defer CookieConsent Banner
**File:** `/Users/lucky/dev/visit-auschwitz-info/visitauschwitz-frontend/src/components/Cookies/CookieConsent.tsx`

**Change:** Wrap banner appearance in setTimeout (2 second delay):
```tsx
useEffect(() => {
  // Defer banner appearance to improve initial page load performance
  const timer = setTimeout(() => {
    if (!getConsentPreferences()) setView('banner')
  }, 2000)
  return () => clearTimeout(timer)
}, [])
```

## 7. Defer Analytics Loading
**File:** `/Users/lucky/dev/visit-auschwitz-info/visitauschwitz-frontend/src/components/Cookies/Analytics.tsx`

**Change:** Wrap GA loading in setTimeout (2 second delay):
```tsx
useEffect(() => {
  if (!GA_ID) return

  // Defer GA loading to improve initial page load performance
  const timer = setTimeout(() => {
    // Pre-emptively block GA before anything else runs. This ensures
    // that even if a third-party script somehow triggers gtag before
    // sync() completes, no hits are sent without explicit consent.
    if (!getConsentPreferences()?.analytics) {
      ;(window as unknown as Record<string, unknown>)[GA_DISABLE_KEY] = true
    }

    sync()

    window.addEventListener('cookie-consent-changed', sync)
  }, 2000)

  return () => {
    clearTimeout(timer)
    window.removeEventListener('cookie-consent-changed', sync)
  }
}, [])
```

## Notes
- After applying these changes, you'll need to update imports across the codebase to use the memoized versions (ImageMediaMemo, AccordionBlockMemo, etc.) instead of the original components
- The 2-second delay for CookieConsent and Analytics is a conservative value that can be adjusted based on testing
- These changes target the INP (Interaction to Next Paint) metric which showed 928ms body interactions and 416ms prose interactions in analytics
