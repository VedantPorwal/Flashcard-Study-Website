import type { Deck } from "./types"

const STORAGE_KEY = "flashcard-decks"
const THEME_KEY = "flashcard-theme"

export const saveDecks = (decks: Deck[]): void => {
  try {
    const allDecks = loadAllDecks()
    // Remove current user's decks and add updated ones
    const otherUserDecks = allDecks.filter((deck) => !decks.find((d) => d.id === deck.id))
    const updatedDecks = [...otherUserDecks, ...decks]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDecks))
  } catch (error) {
    console.error("Failed to save decks:", error)
  }
}

export const loadAllDecks = (): Deck[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const decks = JSON.parse(stored)
    return decks.map((deck: any) => ({
      ...deck,
      createdAt: new Date(deck.createdAt),
      lastStudied: deck.lastStudied ? new Date(deck.lastStudied) : undefined,
      flashcards: deck.flashcards.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
        lastStudied: card.lastStudied ? new Date(card.lastStudied) : undefined,
      })),
    }))
  } catch (error) {
    console.error("Failed to load decks:", error)
    return []
  }
}

export const loadUserDecks = (userId: string): Deck[] => {
  const allDecks = loadAllDecks()
  return allDecks.filter((deck) => deck.userId === userId)
}

export const loadDecks = (): Deck[] => {
  return loadAllDecks()
}

export const saveTheme = (theme: "light" | "dark"): void => {
  localStorage.setItem(THEME_KEY, theme)
}

export const loadTheme = (): "light" | "dark" => {
  return (localStorage.getItem(THEME_KEY) as "light" | "dark") || "light"
}

export const exportDeck = (deck: Deck): void => {
  const dataStr = JSON.stringify(deck, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${deck.name.replace(/\s+/g, "_")}_flashcards.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
