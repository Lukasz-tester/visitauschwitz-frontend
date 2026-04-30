import { test, expect } from '@playwright/test'

const VISUAL_PAGES: Array<{ name: string; path: string; mask?: string[] }> = [
  { name: 'home-en', path: '/en/' },
  { name: 'home-pl', path: '/pl/' },
  { name: 'posts-list-en', path: '/en/posts' },
  { name: 'tour-en', path: '/en/tour', mask: ['.leaflet-container'] }, // map tiles vary
  { name: 'faq-en', path: '/en/faq' },
  { name: 'arrival-en', path: '/en/arrival' },
  { name: 'tickets-en', path: '/en/tickets' },
  { name: 'newsletter-en', path: '/en/newsletter' },
  { name: 'not-found', path: '/en/__deliberately_missing_path__' },
]

for (const { name, path, mask } of VISUAL_PAGES) {
  test(`@visual ${name}`, async ({ page }) => {
    const res = await page.goto(path)
    if (!res || res.status() >= 400) {
      // 404 page is itself a snapshot target; treat any other failure as fatal
      if (name !== 'not-found') throw new Error(`${path} returned ${res?.status()}`)
    }
    await page.evaluate(() => document.fonts?.ready ?? Promise.resolve())
    await page.waitForLoadState('networkidle').catch(() => {})

    // Hide elements that legitimately animate / vary across runs
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    })

    const masks = (mask ?? []).map((sel) => page.locator(sel))
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      mask: masks,
    })
  })
}
