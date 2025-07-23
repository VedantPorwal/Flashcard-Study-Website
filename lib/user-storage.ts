import type { User } from "./types"

const USERS_STORAGE_KEY = "flashcard-users"

interface StoredUser extends User {
  password: string
}

export const getUsers = (): StoredUser[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (!stored) return []

    const users = JSON.parse(stored)
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      lastLogin: new Date(user.lastLogin),
    }))
  } catch (error) {
    console.error("Failed to load users:", error)
    return []
  }
}

export const saveUsers = (users: StoredUser[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (error) {
    console.error("Failed to save users:", error)
  }
}

export const getUserById = (id: string): User | null => {
  const users = getUsers()
  const user = users.find((u) => u.id === id)
  if (!user) return null

  // Return user without password
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}
