"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Clock } from "lucide-react"
import { useFlashcards } from "@/contexts/flashcard-context"
import type { Deck } from "@/lib/types"
import DeckCard from "@/components/deck-card"
import CreateDeckModal from "@/components/create-deck-modal"
import DeckView from "@/components/deck-view"
import StudyMode from "@/components/study-mode"
import { useAuth } from "@/contexts/auth-context"
import AuthPage from "@/components/auth/auth-page"
import UserMenu from "@/components/user-menu"
import { loadUserDecks } from "@/lib/storage"

type View = "home" | "deck" | "study"

export default function Home() {
  const { state: authState } = useAuth()
  const { state, dispatch } = useFlashcards()
  const [currentView, setCurrentView] = useState<View>("home")
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [isCreatingDeck, setIsCreatingDeck] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)

  // Always call hooks at the top level
  const stats = useMemo(() => {
    const totalCards = state.decks.reduce((total, deck) => total + deck.flashcards.length, 0)
    const studiedDecks = state.decks.filter((deck) => deck.lastStudied).length
    return { totalCards, studiedDecks }
  }, [state.decks])

  // Load user decks when user changes
  useEffect(() => {
    if (authState.user) {
      const userDecks = loadUserDecks(authState.user.id)
      dispatch({ type: "SET_DECKS", payload: userDecks })
    }
  }, [authState.user, dispatch])

  const handleCreateDeck = (deckData: Omit<Deck, "id" | "createdAt">) => {
    if (!authState.user) return

    const newDeck: Deck = {
      ...deckData,
      id: Date.now().toString(),
      createdAt: new Date(),
      userId: authState.user.id,
    }

    dispatch({ type: "ADD_DECK", payload: newDeck })
  }

  const handleEditDeck = (deckData: Omit<Deck, "id" | "createdAt">) => {
    if (!editingDeck) return

    const updatedDeck: Deck = {
      ...editingDeck,
      ...deckData,
    }

    dispatch({ type: "UPDATE_DECK", payload: updatedDeck })
    setEditingDeck(null)
  }

  const handleDeleteDeck = (deckId: string) => {
    if (confirm("Are you sure you want to delete this deck? This action cannot be undone.")) {
      dispatch({ type: "DELETE_DECK", payload: deckId })
    }
  }

  const handleStudyDeck = (deck: Deck) => {
    if (deck.flashcards.length === 0) {
      alert("This deck has no flashcards to study!")
      return
    }
    setSelectedDeck(deck)
    setCurrentView("study")
  }

  const handleEditDeckClick = (deck: Deck) => {
    setSelectedDeck(deck)
    setCurrentView("deck")
  }

  const handleBackToHome = () => {
    setCurrentView("home")
    setSelectedDeck(null)
  }

  // Show loading screen while checking authentication
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-green-700 dark:text-green-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth page if not authenticated
  if (!authState.isAuthenticated) {
    return <AuthPage />
  }

  if (currentView === "study" && selectedDeck) {
    return <StudyMode deck={selectedDeck} onExit={handleBackToHome} />
  }

  if (currentView === "deck" && selectedDeck) {
    return <DeckView deck={selectedDeck} onBack={handleBackToHome} onStudy={handleStudyDeck} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Flashcard Study App</h1>
              {state.decks.length > 0 && (
                <p className="text-sm text-green-600 dark:text-green-300">
                  Welcome back, {authState.user?.name}! • {state.decks.length} decks • {stats.totalCards} cards
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {state.isAutoSaving && (
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mr-2">
                <Clock className="w-3 h-3 animate-spin" />
                Saving...
              </div>
            )}

            <Button
              onClick={() => setIsCreatingDeck(true)}
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Deck
            </Button>

            <UserMenu />
          </div>
        </header>

        {state.decks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-24 h-24 text-green-300 dark:text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-green-800 dark:text-green-200 mb-4">
              Welcome to Flashcard Study!
            </h2>
            <p className="text-green-600 dark:text-green-300 mb-6 max-w-md mx-auto">
              Create your first deck to start studying. Organize your flashcards by topic and track your progress.
            </p>
            <Button
              onClick={() => setIsCreatingDeck(true)}
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Deck
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">Your Study Decks</h2>
              <div className="flex items-center gap-4 text-green-600 dark:text-green-300">
                <span>
                  {state.decks.length} {state.decks.length === 1 ? "deck" : "decks"}
                </span>
                <span>•</span>
                <span>{stats.totalCards} total cards</span>
                {state.lastSaved && !state.isAutoSaving && (
                  <>
                    <span>•</span>
                    <span className="text-xs text-green-500">Last saved: {state.lastSaved.toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {state.decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  onStudy={handleStudyDeck}
                  onEdit={handleEditDeckClick}
                  onDelete={handleDeleteDeck}
                />
              ))}
            </div>
          </>
        )}

        <CreateDeckModal isOpen={isCreatingDeck} onClose={() => setIsCreatingDeck(false)} onSave={handleCreateDeck} />

        <CreateDeckModal
          isOpen={!!editingDeck}
          onClose={() => setEditingDeck(null)}
          onSave={handleEditDeck}
          editingDeck={editingDeck || undefined}
        />
      </div>
    </div>
  )
}
