"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Search, Play, Clock } from "lucide-react"
import type { Deck, Flashcard } from "@/lib/types"
import { useFlashcards } from "@/contexts/flashcard-context"
import FlashcardForm from "./flashcard-form"
import FlashcardPreview from "./flashcard-preview"

interface DeckViewProps {
  deck: Deck
  onBack: () => void
  onStudy: (deck: Deck) => void
}

export default function DeckView({ deck, onBack, onStudy }: DeckViewProps) {
  const { state, dispatch } = useFlashcards()
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Real-time filtered cards with memoization for performance
  const filteredCards = useMemo(() => {
    if (!searchTerm.trim()) return deck.flashcards

    const searchLower = searchTerm.toLowerCase()
    return deck.flashcards.filter(
      (card) => card.front.toLowerCase().includes(searchLower) || card.back.toLowerCase().includes(searchLower),
    )
  }, [deck.flashcards, searchTerm])

  // Optimistic update for adding cards
  const handleAddCard = useCallback(
    (cardData: Omit<Flashcard, "id" | "createdAt">) => {
      const newCard: Flashcard = {
        ...cardData,
        id: Date.now().toString(),
        createdAt: new Date(),
      }

      dispatch({
        type: "ADD_FLASHCARD",
        payload: { deckId: deck.id, flashcard: newCard },
      })
    },
    [deck.id, dispatch],
  )

  // Optimistic update for editing cards
  const handleEditCard = useCallback(
    (cardData: Omit<Flashcard, "id" | "createdAt">) => {
      if (!editingCard) return

      const updatedCard: Flashcard = {
        ...editingCard,
        ...cardData,
      }

      dispatch({
        type: "UPDATE_FLASHCARD",
        payload: { deckId: deck.id, flashcard: updatedCard },
      })
      setEditingCard(null)
    },
    [editingCard, deck.id, dispatch],
  )

  // Optimistic update for deleting cards
  const handleDeleteCard = useCallback(
    (cardId: string) => {
      // Optimistic update - remove immediately
      dispatch({
        type: "DELETE_FLASHCARD",
        payload: { deckId: deck.id, flashcardId: cardId },
      })
    },
    [deck.id, dispatch],
  )

  // Real-time search with debouncing for performance
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 bg-transparent transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Decks
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={() => onStudy(deck)}
              disabled={deck.flashcards.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
            >
              <Play className="w-4 h-4 mr-2" />
              Study Deck
            </Button>
            <Button
              onClick={() => setIsAddingCard(true)}
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">{deck.name}</h1>
          {deck.description && <p className="text-green-600 dark:text-green-300 mb-4">{deck.description}</p>}
          <div className="flex items-center gap-4 text-green-700 dark:text-green-300">
            <span>
              {deck.flashcards.length} {deck.flashcards.length === 1 ? "card" : "cards"}
            </span>
            {searchTerm && (
              <span className="text-sm">
                • {filteredCards.length} matching "{searchTerm}"
              </span>
            )}
            {state.isAutoSaving && (
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3 animate-spin" />
                Saving...
              </div>
            )}
            {state.lastSaved && !state.isAutoSaving && (
              <span className="text-xs text-green-500">Saved {state.lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
        </div>

        {deck.flashcards.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
              <Input
                placeholder="Search flashcards..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 border-green-300 focus:border-green-500 dark:border-green-600 transition-all duration-200"
              />
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        )}

        {filteredCards.length === 0 && deck.flashcards.length > 0 && (
          <div className="text-center py-8">
            <p className="text-green-600 dark:text-green-400">No flashcards match your search.</p>
            <Button
              onClick={() => setSearchTerm("")}
              variant="outline"
              className="mt-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300"
            >
              Clear search
            </Button>
          </div>
        )}

        {deck.flashcards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-green-600 dark:text-green-400 mb-4">
              <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No flashcards yet</p>
              <p className="text-sm">Add your first flashcard to get started!</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => (
            <FlashcardPreview key={card.id} card={card} onEdit={setEditingCard} onDelete={handleDeleteCard} />
          ))}
        </div>

        <FlashcardForm isOpen={isAddingCard} onClose={() => setIsAddingCard(false)} onSave={handleAddCard} />

        <FlashcardForm
          isOpen={!!editingCard}
          onClose={() => setEditingCard(null)}
          onSave={handleEditCard}
          editingCard={editingCard || undefined}
        />
      </div>
    </div>
  )
}
