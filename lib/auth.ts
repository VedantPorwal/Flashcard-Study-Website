import { hashPassword, comparePasswords } from "./password"
import type { User, LoginCredentials, RegisterCredentials } from "./types"
import { getUsers, saveUsers, getUserById } from "./user-storage"

const SESSION_KEY = "flashcard-session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

interface Session {
  userId: string
  expiresAt: number
}

export const register = async (
  credentials: RegisterCredentials,
): Promise<{ success: boolean; error?: string; user?: User }> => {
  const users = getUsers()
  const existingUser = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase())

  if (existingUser) {
    return { success: false, error: "Email already in use" }
  }

  if (credentials.password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }

  const hashedPassword = hashPassword(credentials.password)

  const newUser: User = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    name: credentials.name,
    email: credentials.email,
    createdAt: new Date(),
    lastLogin: new Date(),
  }

  users.push({ ...newUser, password: hashedPassword })
  saveUsers(users)

  return { success: true, user: newUser }
}

export const createDemoUser = (): void => {
  const users = getUsers()
  const demoExists = users.find((u) => u.email === "demo@example.com")

  if (!demoExists) {
    const demoUser = {
      id: "demo-user-id",
      name: "Demo User",
      email: "demo@example.com",
      password: hashPassword("demo123"),
      createdAt: new Date("2024-01-01"),
      lastLogin: new Date(),
    }

    users.push(demoUser)
    saveUsers(users)
  }
}

export const login = async (
  credentials: LoginCredentials,
): Promise<{ success: boolean; error?: string; user?: User }> => {
  // Create demo user if it doesn't exist
  createDemoUser()

  const users = getUsers()
  const user = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase())

  if (!user) {
    return { success: false, error: "Invalid email or password" }
  }

  const passwordMatch = comparePasswords(credentials.password, user.password)

  if (!passwordMatch) {
    return { success: false, error: "Invalid email or password" }
  }

  // Update last login
  user.lastLogin = new Date()
  saveUsers(users)

  // Return user without password
  const { password, ...userWithoutPassword } = user
  return { success: true, user: userWithoutPassword }
}

export const saveSession = (user: User): void => {
  const session: Session = {
    userId: user.id,
    expiresAt: Date.now() + SESSION_DURATION,
  }

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error("Failed to save session:", error)
  }
}

export const getSession = (): User | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return null

    const session: Session = JSON.parse(stored)

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      clearSession()
      return null
    }

    // Get user data
    const user = getUserById(session.userId)
    return user
  } catch (error) {
    console.error("Failed to get session:", error)
    clearSession()
    return null
  }
}

export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.error("Failed to clear session:", error)
  }
}

export const updateUserProfile = async (
  userId: string,
  updates: { name?: string; email?: string },
): Promise<{ success: boolean; error?: string; user?: User }> => {
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    return { success: false, error: "User not found" }
  }

  // Check if email is already in use by another user
  if (updates.email) {
    const emailExists = users.find((u) => u.id !== userId && u.email.toLowerCase() === updates.email!.toLowerCase())
    if (emailExists) {
      return { success: false, error: "Email already in use" }
    }
  }

  // Update user
  const user = users[userIndex]
  if (updates.name) user.name = updates.name
  if (updates.email) user.email = updates.email

  saveUsers(users)

  // Return updated user without password
  const { password, ...userWithoutPassword } = user
  return { success: true, user: userWithoutPassword }
}
