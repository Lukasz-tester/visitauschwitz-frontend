import { test, expect } from '@playwright/test'

test('home page responds', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok() || (response?.status() ?? 0) < 400).toBeTruthy()
})
