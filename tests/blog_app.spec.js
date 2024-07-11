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
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Superuser',
        username: 'root',
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

    test('User can like a blog', async ({ page }) => {
      createBlog(page, 'title', 'author', 'url')
      const viewButton = page.getByRole('button', { name: 'view' })
      await viewButton.click()
      // Should have a value of 0 in the div
      await expect(page.getByTestId('viewBlogRender')).toContainText('0')

      const likeButton = page.getByRole('button', { name: 'like' })
      // Click it
      await likeButton.click()
      // Check that there is now a 1 inside
      await expect(page.getByTestId('viewBlogRender')).toContainText('1')
    })

    test('User who added the blog can remove it', async ({ page }) => {
      await createBlog(page, 'title', 'author', 'url')
      const viewButton = page.getByRole('button', { name: 'view' })
      await viewButton.click()
      // Find remove button
      const removeButton = page.getByRole('button', { name: 'remove' })
      await removeButton.click()

      // Check that the blog is not there
      await expect(page.getByTestId('initialBlogRender')).not.toBeVisible()
    })
  })

  describe('Another user test', () => {
    test.only('Only user who added the blog can see the remove button', async ({
      page,
    }) => {
      // Now is logged in as Matti
      loginHelper(page, 'mluukkai', 'salainen')
      // Create a blog
      await createBlog(page, 'title', 'author', 'url')
      // Logout
      const logoutButton = page.getByRole('button', { name: 'Logout' })
      await logoutButton.click()
      // Login to Superuser
      await loginHelper(page, 'root', 'salainen')
      // Open the view
      const viewButton = page.getByRole('button', { name: 'view' })
      await viewButton.click()
      // Check if remove not there
      await expect(
        page.getByRole('button', { name: 'remove' })
      ).not.toBeVisible()
    })
  })
})
