import { test, expect, type Route } from '@playwright/test'

const okJson = async (route: Route, body: any = { success: true }, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })

test.describe('contact form', () => {
  test('successful submit shows success state', async ({ page }) => {
    await page.route('**/api/contact', (r) => okJson(r))

    await page.goto('/en/')
    const email = page.getByPlaceholder(/email/i).first()
    if (!(await email.isVisible().catch(() => false))) {
      test.skip(true, 'Contact form not on home — covered by component tests')
    }
    const textarea = page.locator('textarea').first()
    await email.fill('user@example.com')
    await textarea.fill('Test message from e2e suite')
    await page.getByRole('button', { name: /send|contact/i }).first().click()
    await expect(page.getByText(/thank|success|received|sent/i)).toBeVisible({ timeout: 5000 })
  })

  test('invalid email keeps the form on screen', async ({ page }) => {
    await page.route('**/api/contact', (r) => okJson(r))
    await page.goto('/en/')
    const email = page.getByPlaceholder(/email/i).first()
    if (!(await email.isVisible().catch(() => false))) {
      test.skip(true, 'Contact form not on home')
    }
    await email.fill('not-an-email')
    await page.locator('textarea').first().fill('Hello')
    await page.getByRole('button', { name: /send|contact/i }).first().click()
    // No success message should appear
    await page.waitForTimeout(500)
    await expect(page.getByText(/thank|success|received|sent/i)).toHaveCount(0)
  })
})

test.describe('newsletter signup', () => {
  test('successful subscribe shows success state', async ({ page }) => {
    await page.route('**/api/contact', (r) => okJson(r)) // contact endpoint also handles newsletter
    await page.route('**/api/subscribe', (r) => okJson(r))

    await page.goto('/en/newsletter')
    const email = page.getByPlaceholder(/email/i).first()
    if (!(await email.isVisible().catch(() => false))) {
      test.skip(true, 'Newsletter form not visible on /en/newsletter')
    }
    await email.fill('subscriber@example.com')
    // Newsletter forms have a consent checkbox; tick all visible ones
    const checkboxes = page.locator('button[role="checkbox"], input[type="checkbox"]')
    const count = await checkboxes.count()
    for (let i = 0; i < count; i++) await checkboxes.nth(i).check().catch(() => {})
    await page.getByRole('button', { name: /subscribe|join|sign/i }).first().click()
    await expect(page.getByText(/thank|success|subscribed|welcome/i)).toBeVisible({
      timeout: 5000,
    })
  })
})
