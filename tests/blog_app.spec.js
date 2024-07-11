const { test, expect, describe, beforeEach } = require('@playwright/test')
const { request } = require('http')
const { loginHelper, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ request, page }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen',
      },
    })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const loginHeader = page.getByText('log in to application')
    await expect(loginHeader).toBeVisible()

    const usernameField = page.getByText('username')
    const passwordField = page.getByText('password')
    await expect(usernameField).toBeVisible()
    await expect(passwordField).toBeVisible()
  })

  describe('Login Tests', () => {
    test('Success with correct credentials', async ({ page }) => {
      await loginHelper(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('Failure with wrong credentials', async ({ page }) => {
      await loginHelper(page, 'mluukkai', 'wrong')
      await expect(page.getByText('invalid username or password')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginHelper(page, 'mluukkai', 'salainen')
    })

    test('User can create a blog', async ({ page }) => {
      createBlog(page, 'title', 'author', 'url')
      // Locate the title, author
      await expect(page.getByTestId('initialBlogRender')).toBeVisible()
    })
  })
})
