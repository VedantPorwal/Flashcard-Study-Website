"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Edit, Trash2 } from "lucide-react"
import type { Flashcard } from "@/lib/types"

interface FlashcardPreviewProps {
  card: Flashcard
  onEdit: (card: Flashcard) => void
  onDelete: (cardId: string) => void
}

export default function FlashcardPreview({ card, onEdit, onDelete }: FlashcardPreviewProps) {
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="group perspective-500">
      <Card className="relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 transform-style-preserve-3d group-hover:rotate-y-12">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-800 dark:text-green-200 text-sm font-medium flex items-center justify-between">
            <span>Flashcard</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnswer(!showAnswer)}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
            >
              {showAnswer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-4">
            {/* Question - Always visible */}
            <div className="mb-3">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Question</p>
              <p className="text-gray-800 dark:text-gray-200 text-sm line-clamp-3">{card.front}</p>
            </div>

            {/* Answer - Only visible when toggled */}
            <div className="border-t border-green-100 dark:border-green-800 pt-3">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Answer</p>
              {showAnswer ? (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 transition-all duration-300">
                  {card.back}
                </p>
              ) : (
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-2">Click eye icon to reveal</p>
                </div>
              )}
            </div>
          </div>

          {(card.timesCorrect > 0 || card.timesIncorrect > 0) && (
            <div className="flex justify-between text-xs text-green-600 dark:text-green-400 mb-3">
              <span>✓ {card.timesCorrect}</span>
              <span>✗ {card.timesIncorrect}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(card)}
              variant="outline"
              size="sm"
              className="flex-1 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 transition-all duration-200"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              onClick={() => onDelete(card.id)}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 transition-all duration-200"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
