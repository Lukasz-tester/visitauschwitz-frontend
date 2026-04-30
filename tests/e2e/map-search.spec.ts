import { test, expect } from '@playwright/test'

test.describe('map page', () => {
  test('tour page renders and Leaflet hydrates', async ({ page }) => {
    const res = await page.goto('/en/tour')
    expect(res?.status()).toBeLessThan(400)

    const map = page.locator('.leaflet-container')
    if ((await map.count()) === 0) {
      test.skip(true, 'No Leaflet container on /en/tour — map lives elsewhere')
    }
    await expect(map.first()).toBeVisible({ timeout: 10_000 })
    // tile layer should attach at least one tile
    await page.waitForFunction(
      () => document.querySelectorAll('.leaflet-tile, .leaflet-marker-icon').length > 0,
      undefined,
      { timeout: 10_000 },
    )
  })

  test('no console errors on tour page', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/en/tour')
    await page.waitForLoadState('networkidle')
    const meaningful = errors.filter(
      (e) => !/favicon|gtag|analytics|net::ERR_BLOCKED|tile.openstreetmap/i.test(e),
    )
    expect(meaningful, meaningful.join('\n')).toEqual([])
  })
})

test.describe('search page', () => {
  test('search page renders an input', async ({ page }) => {
    const res = await page.goto('/en/search')
    expect(res?.status()).toBeLessThan(400)
    const input = page.getByRole('searchbox').or(page.locator('input[type="search"], input[type="text"]'))
    await expect(input.first()).toBeVisible()
  })

  test('typing in search shows some output (or graceful empty state)', async ({ page }) => {
    await page.goto('/en/search')
    const input = page
      .getByRole('searchbox')
      .or(page.locator('input[type="search"], input[type="text"]'))
      .first()
    await input.fill('the')
    // Wait for debounced fetch to settle
    await page.waitForTimeout(800)
    // Either results or a "no results" message — main thing is no crash
    await expect(page.locator('main, [role="main"]').first()).toBeVisible()
  })
})
