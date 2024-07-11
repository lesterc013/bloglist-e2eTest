const loginHelper = async (page, username, password) => {
  const usernameInput = page.getByTestId('username')
  const passwordInput = page.getByTestId('password')
  const loginButton = page.getByRole('button', { name: 'Login' })
  await usernameInput.fill(username)
  await passwordInput.fill(password)
  await loginButton.click()
}

export { loginHelper }
