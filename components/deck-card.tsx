"use client"

import type { Deck } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Edit, Trash2, Download } from "lucide-react"
import { exportDeck } from "@/lib/storage"

interface DeckCardProps {
  deck: Deck
  onStudy: (deck: Deck) => void
  onEdit: (deck: Deck) => void
  onDelete: (deckId: string) => void
}

export default function DeckCard({ deck, onStudy, onEdit, onDelete }: DeckCardProps) {
  const handleExport = () => {
    exportDeck(deck)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-800 dark:text-green-200 text-lg font-semibold">{deck.name}</CardTitle>
        <p className="text-green-600 dark:text-green-300 text-sm line-clamp-2">{deck.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <span className="text-green-700 dark:text-green-300 text-sm font-medium">
            {deck.flashcards.length} {deck.flashcards.length === 1 ? "card" : "cards"}
          </span>
          {deck.lastStudied && (
            <span className="text-green-600 dark:text-green-400 text-xs">
              Last studied: {deck.lastStudied.toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => onStudy(deck)}
            disabled={deck.flashcards.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <Play className="w-4 h-4 mr-1" />
            Study
          </Button>

          <Button
            onClick={() => onEdit(deck)}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
            size="sm"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleExport}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20 bg-transparent"
            size="sm"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => onDelete(deck.id)}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
