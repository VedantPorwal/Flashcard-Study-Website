"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react"
import type { Deck, Flashcard } from "@/lib/types"
import { saveDecks, loadDecks, saveTheme, loadTheme } from "@/lib/storage"

interface FlashcardState {
  decks: Deck[]
  currentDeck: Deck | null
  theme: "light" | "dark"
  isAutoSaving: boolean
  lastSaved: Date | null
}

type FlashcardAction =
  | { type: "SET_DECKS"; payload: Deck[] }
  | { type: "SET_USER_DECKS"; payload: { decks: Deck[]; userId: string } }
  | { type: "ADD_DECK"; payload: Deck }
  | { type: "UPDATE_DECK"; payload: Deck }
  | { type: "DELETE_DECK"; payload: string }
  | { type: "SET_CURRENT_DECK"; payload: Deck | null }
  | { type: "ADD_FLASHCARD"; payload: { deckId: string; flashcard: Flashcard } }
  | { type: "UPDATE_FLASHCARD"; payload: { deckId: string; flashcard: Flashcard } }
  | { type: "DELETE_FLASHCARD"; payload: { deckId: string; flashcardId: string } }
  | { type: "UPDATE_FLASHCARD_STATS"; payload: { deckId: string; flashcardId: string; correct: boolean } }
  | { type: "TOGGLE_THEME" }
  | { type: "SET_AUTO_SAVING"; payload: boolean }
  | { type: "SET_LAST_SAVED"; payload: Date }

const initialState: FlashcardState = {
  decks: [],
  currentDeck: null,
  theme: "light",
  isAutoSaving: false,
  lastSaved: null,
}

const flashcardReducer = (state: FlashcardState, action: FlashcardAction): FlashcardState => {
  switch (action.type) {
    case "SET_DECKS":
      return { ...state, decks: action.payload }

    case "SET_USER_DECKS":
      const userDecks = action.payload.decks.filter((deck) => deck.userId === action.payload.userId)
      return { ...state, decks: userDecks }

    case "ADD_DECK":
      return { ...state, decks: [...state.decks, action.payload] }

    case "UPDATE_DECK":
      return {
        ...state,
        decks: state.decks.map((deck) => (deck.id === action.payload.id ? action.payload : deck)),
        currentDeck: state.currentDeck?.id === action.payload.id ? action.payload : state.currentDeck,
      }

    case "DELETE_DECK":
      return {
        ...state,
        decks: state.decks.filter((deck) => deck.id !== action.payload),
        currentDeck: state.currentDeck?.id === action.payload ? null : state.currentDeck,
      }

    case "SET_CURRENT_DECK":
      return { ...state, currentDeck: action.payload }

    case "ADD_FLASHCARD":
      return {
        ...state,
        decks: state.decks.map((deck) =>
          deck.id === action.payload.deckId
            ? { ...deck, flashcards: [...deck.flashcards, action.payload.flashcard] }
            : deck,
        ),
        currentDeck:
          state.currentDeck?.id === action.payload.deckId
            ? { ...state.currentDeck, flashcards: [...state.currentDeck.flashcards, action.payload.flashcard] }
            : state.currentDeck,
      }

    case "UPDATE_FLASHCARD":
      return {
        ...state,
        decks: state.decks.map((deck) =>
          deck.id === action.payload.deckId
            ? {
                ...deck,
                flashcards: deck.flashcards.map((card) =>
                  card.id === action.payload.flashcard.id ? action.payload.flashcard : card,
                ),
              }
            : deck,
        ),
        currentDeck:
          state.currentDeck?.id === action.payload.deckId
            ? {
                ...state.currentDeck,
                flashcards: state.currentDeck.flashcards.map((card) =>
                  card.id === action.payload.flashcard.id ? action.payload.flashcard : card,
                ),
              }
            : state.currentDeck,
      }

    case "DELETE_FLASHCARD":
      return {
        ...state,
        decks: state.decks.map((deck) =>
          deck.id === action.payload.deckId
            ? { ...deck, flashcards: deck.flashcards.filter((card) => card.id !== action.payload.flashcardId) }
            : deck,
        ),
        currentDeck:
          state.currentDeck?.id === action.payload.deckId
            ? {
                ...state.currentDeck,
                flashcards: state.currentDeck.flashcards.filter((card) => card.id !== action.payload.flashcardId),
              }
            : state.currentDeck,
      }

    case "UPDATE_FLASHCARD_STATS":
      return {
        ...state,
        decks: state.decks.map((deck) =>
          deck.id === action.payload.deckId
            ? {
                ...deck,
                lastStudied: new Date(),
                flashcards: deck.flashcards.map((card) =>
                  card.id === action.payload.flashcardId
                    ? {
                        ...card,
                        lastStudied: new Date(),
                        timesCorrect: action.payload.correct ? card.timesCorrect + 1 : card.timesCorrect,
                        timesIncorrect: !action.payload.correct ? card.timesIncorrect + 1 : card.timesIncorrect,
                      }
                    : card,
                ),
              }
            : deck,
        ),
      }

    case "TOGGLE_THEME":
      const newTheme = state.theme === "light" ? "dark" : "light"
      saveTheme(newTheme)
      return { ...state, theme: newTheme }

    case "SET_AUTO_SAVING":
      return { ...state, isAutoSaving: action.payload }

    case "SET_LAST_SAVED":
      return { ...state, lastSaved: action.payload }

    default:
      return state
  }
}

const FlashcardContext = createContext<{
  state: FlashcardState
  dispatch: React.Dispatch<FlashcardAction>
} | null>(null)

export const FlashcardProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(flashcardReducer, initialState)

  // Debounced auto-save function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (decks: Deck[]) => {
        dispatch({ type: "SET_AUTO_SAVING", payload: true })
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          saveDecks(decks)
          dispatch({ type: "SET_AUTO_SAVING", payload: false })
          dispatch({ type: "SET_LAST_SAVED", payload: new Date() })
        }, 300) // 300ms debounce
      }
    })(),
    [],
  )

  useEffect(() => {
    const decks = loadDecks()
    const theme = loadTheme()
    dispatch({ type: "SET_DECKS", payload: decks })
    if (theme === "dark") {
      dispatch({ type: "TOGGLE_THEME" })
    }
  }, [])

  useEffect(() => {
    if (state.decks.length > 0) {
      debouncedSave(state.decks)
    }
  }, [state.decks, debouncedSave])

  useEffect(() => {
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [state.theme])

  return <FlashcardContext.Provider value={{ state, dispatch }}>{children}</FlashcardContext.Provider>
}

export const useFlashcards = () => {
  const context = useContext(FlashcardContext)
  if (!context) {
    throw new Error("useFlashcards must be used within a FlashcardProvider")
  }
  return context
}
