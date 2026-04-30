import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const A11Y_PAGES = [
  { name: 'home-en', path: '/en/' },
  { name: 'home-pl', path: '/pl/' },
  { name: 'posts', path: '/en/posts' },
  { name: 'tour', path: '/en/tour' },
  { name: 'newsletter', path: '/en/newsletter' },
]

// Only run a11y on one project — accessibility issues are mostly DOM-driven
// and don't differ across browser engines. Saves ~75% of the run time.
test.skip(({ browserName, isMobile }) => {
  return browserName !== 'chromium' || !!isMobile
}, 'a11y runs on desktop chromium only')

for (const { name, path } of A11Y_PAGES) {
  test(`a11y: ${name}`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle').catch(() => {})
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  })
}
