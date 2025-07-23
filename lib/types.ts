export interface Flashcard {
  id: string
  front: string
  back: string
  createdAt: Date
  lastStudied?: Date
  timesCorrect: number
  timesIncorrect: number
}

export interface Deck {
  id: string
  name: string
  description: string
  flashcards: Flashcard[]
  createdAt: Date
  lastStudied?: Date
  userId: string // Add user association
}

export interface StudySession {
  deckId: string
  currentCardIndex: number
  isFlipped: boolean
  correctCount: number
  incorrectCount: number
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  lastLogin: Date
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}
