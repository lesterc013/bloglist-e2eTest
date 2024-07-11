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

    test.only('Blogs are in order of most likes to least', async ({ page }) => {
      // Add two different blogs
      await createBlog(page, '1 likes', 'author', 'url')
      await page
        .getByTestId('initialBlogRender')
        .filter({ hasText: '1 likes, author' })
        .waitFor()

      await createBlog(page, '2 likes', 'author', 'url')
      await page
        .getByTestId('initialBlogRender')
        .filter({ hasText: '2 likes, author' })
        .waitFor()

      // Then need to selectively get each blog's view button first, and click
      await page
        .getByText('1 likes, author')
        .getByRole('button', { name: 'view' })
        .click()
      await page
        .getByText('2 likes, author')
        .getByRole('button', { name: 'view' })
        .click()

      // Click them in descending order
      await page
        .getByText('1 likes, author')
        .getByRole('button', { name: 'like' })
        .click()

      await page
        .getByText('2 likes, author')
        .getByRole('button', { name: 'like' })
        .click()
      await page
        .getByText('2 likes, author')
        .getByRole('button', { name: 'like' })
        .click()

      // first should guarantee that we select the first element encountered with testid viewBlogRender -- that is the one with 2 likes; last will select the 1 like
      const twoLikesDiv = page.getByTestId('viewBlogRender').first()
      const oneLikesDiv = page.getByTestId('viewBlogRender').last()

      await expect(twoLikesDiv).toContainText('2')
      await expect(twoLikesDiv).not.toContainText('1')

      await expect(oneLikesDiv).toContainText('1')
      await expect(oneLikesDiv).not.toContainText('2')
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
