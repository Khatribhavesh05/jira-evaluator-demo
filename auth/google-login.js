// Google OAuth Login Implementation
const googleLogin = async () => {
  try {
    const popup = window.open('/auth/google', 'googleLogin')
    const user = await waitForAuth(popup)
    redirectToDashboard(user)
  } catch (error) {
    // TODO: show error message to user
  }
}

const redirectToDashboard = (user) => {
  window.location.href = '/dashboard'
}

module.exports = { googleLogin }
