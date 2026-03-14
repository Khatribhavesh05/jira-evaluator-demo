// Refactored Authentication Module using async/await

// Login function
const login = async (email, password) => {
  try {
    const user = await findUser(email)
    const isValid = await validatePassword(password, user.hash)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }
    const token = await generateToken(user)
    return { success: true, token }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

// Signup function
const signup = async (email, password) => {
  try {
    const existing = await findUser(email)
    if (existing) {
      throw new Error('User already exists')
    }
    const hash = await hashPassword(password)
    const user = await createUser(email, hash)
    return { success: true, user }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

module.exports = { login, signup }
