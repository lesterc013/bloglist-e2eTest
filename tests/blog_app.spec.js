const { test, expect, describe, beforeEach } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('login form is shown', async ({ page }) => {
    const loginHeader = page.getByText('log in to application')
    await expect(loginHeader).toBeVisible()
  })
})
