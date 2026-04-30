import { test, expect } from '@playwright/test'

test.describe('smoke — critical pages render', () => {
  test('English home renders with header + footer', async ({ page }) => {
    const res = await page.goto('/en/')
    expect(res?.status()).toBeLessThan(400)
    await expect(page.locator('header').first()).toBeVisible()
    await expect(page.locator('footer').first()).toBeVisible()
    await expect(page).toHaveTitle(/.+/)
  })

  test('Polish home renders', async ({ page }) => {
    const res = await page.goto('/pl/')
    expect(res?.status()).toBeLessThan(400)
    await expect(page.locator('header').first()).toBeVisible()
  })

  test('posts list renders', async ({ page }) => {
    const res = await page.goto('/en/posts')
    expect(res?.status()).toBeLessThan(400)
    // either article tiles or a "no results" text
    const hasContent = await page.locator('article, [role="article"], main').first().isVisible()
    expect(hasContent).toBeTruthy()
  })

  test('404 page renders for an unknown slug', async ({ page }) => {
    const res = await page.goto('/en/this-slug-does-not-exist-xyz123')
    // static export typically serves a not-found page with 200 or 404
    expect([200, 404]).toContain(res?.status() ?? 200)
    await expect(page.locator('body')).toContainText(/not found|404|home/i)
  })

  test('no console errors on home page', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/en/')
    await page.waitForLoadState('networkidle')
    // filter out expected noise (e.g. third-party tracking blocked by browser)
    const meaningful = errors.filter(
      (e) => !/favicon|gtag|analytics|net::ERR_BLOCKED/i.test(e),
    )
    expect(meaningful, meaningful.join('\n')).toEqual([])
  })
})

test.describe('smoke — locale auto-redirect', () => {
  test('root path redirects to a locale prefix', async ({ page, baseURL }) => {
    // Direct navigation to "/" — the Cloudflare _middleware does the redirect
    // in production, but `next start` also lays out the static export so /
    // should resolve to a locale-prefixed page.
    const res = await page.goto('/')
    expect(res?.status()).toBeLessThan(400)
    expect(page.url()).toMatch(new RegExp(`${baseURL}/(en|pl)/?$`))
  })
})
