const loginHelper = async (page, username, password) => {
  const usernameInput = page.getByTestId('username')
  const passwordInput = page.getByTestId('password')
  const loginButton = page.getByRole('button', { name: 'Login' })
  await usernameInput.fill(username)
  await passwordInput.fill(password)
  await loginButton.click()
}

const createBlog = async (page, title, author, url) => {
  // Locate a new blog button
  const newBlogButton = page.getByRole('button', { name: 'a new blog' })
  // Click it
  await newBlogButton.click()
  // Locate the title, author, url
  const titleInput = page.getByTestId('titleInput')
  const authorInput = page.getByTestId('authorInput')
  const urlInput = page.getByTestId('blogUrlInput')
  // Fill them in
  await titleInput.fill(title)
  await authorInput.fill(author)
  await urlInput.fill(url)
  // Locate the Create button
  const createButton = page.getByRole('button', { name: 'create' })
  // Click it
  await createButton.click()
}

export { loginHelper, createBlog }
