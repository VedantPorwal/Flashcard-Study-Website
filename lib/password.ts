// Simple password hashing utility for demo purposes
// In production, use bcrypt or similar secure hashing library

export const hashPassword = (password: string): string => {
  // Simple hash function for demo - NOT secure for production
  let hash = 0
  const salt = "flashcard-app-salt"
  const combined = password + salt

  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return hash.toString(36)
}

export const comparePasswords = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword
}
