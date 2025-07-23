"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, Eye } from "lucide-react"
import type { Flashcard } from "@/lib/types"

interface FlashcardFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (flashcard: Omit<Flashcard, "id" | "createdAt">) => void
  editingCard?: Flashcard
}

export default function FlashcardForm({ isOpen, onClose, onSave, editingCard }: FlashcardFormProps) {
  const [front, setFront] = useState(editingCard?.front || "")
  const [back, setBack] = useState(editingCard?.back || "")
  const [isPreview, setIsPreview] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Auto-save draft to localStorage
  const saveDraft = useCallback(() => {
    if (front.trim() || back.trim()) {
      localStorage.setItem("flashcard-draft", JSON.stringify({ front, back }))
    }
  }, [front, back])

  // Load draft on mount
  useEffect(() => {
    if (!editingCard && isOpen) {
      const draft = localStorage.getItem("flashcard-draft")
      if (draft) {
        try {
          const { front: draftFront, back: draftBack } = JSON.parse(draft)
          setFront(draftFront || "")
          setBack(draftBack || "")
        } catch (error) {
          console.error("Failed to load draft:", error)
        }
      }
    }
  }, [editingCard, isOpen])

  // Auto-save draft with debounce
  useEffect(() => {
    const timeoutId = setTimeout(saveDraft, 500)
    return () => clearTimeout(timeoutId)
  }, [front, back, saveDraft])

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = editingCard
      ? front !== editingCard.front || back !== editingCard.back
      : front.trim() !== "" || back.trim() !== ""
    setHasUnsavedChanges(hasChanges)
  }, [front, back, editingCard])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return

    onSave({
      front: front.trim(),
      back: back.trim(),
      lastStudied: editingCard?.lastStudied,
      timesCorrect: editingCard?.timesCorrect || 0,
      timesIncorrect: editingCard?.timesIncorrect || 0,
    })

    // Clear draft after successful save
    localStorage.removeItem("flashcard-draft")

    if (!editingCard) {
      setFront("")
      setBack("")
    }
    setHasUnsavedChanges(false)
    onClose()
  }

  const handleClose = () => {
    if (!editingCard) {
      setFront("")
      setBack("")
    }
    setIsPreview(false)
    onClose()
  }

  const handleQuickSave = () => {
    if (front.trim() && back.trim()) {
      handleSubmit(new Event("submit") as any)
    }
  }

  // Auto-resize textareas
  const handleTextareaChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const textarea = e.target
    setter(textarea.value)

    // Auto-resize
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
        <DialogHeader>
          <DialogTitle className="text-green-800 dark:text-green-200 flex items-center justify-between">
            <span>{editingCard ? "Edit Flashcard" : "Add New Flashcard"}</span>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && <span className="text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300"
              >
                <Eye className="w-4 h-4 mr-1" />
                {isPreview ? "Edit" : "Preview"}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isPreview ? (
          <div className="space-y-4">
            <div className="perspective-1000">
              <div className="relative w-full min-h-[200px] transform-style-preserve-3d">
                <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 shadow-lg rounded-lg p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        Question
                      </span>
                    </div>
                    <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {front || "Enter your question..."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="perspective-1000">
              <div className="relative w-full min-h-[200px] transform-style-preserve-3d">
                <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700 shadow-lg rounded-lg p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                        Answer
                      </span>
                    </div>
                    <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {back || "Enter your answer..."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="front" className="text-green-700 dark:text-green-300 flex items-center justify-between">
                <span>Front (Question)</span>
                <span className="text-xs text-gray-500">{front.length}/500</span>
              </Label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => handleTextareaChange(e, setFront)}
                placeholder="Enter the question or prompt..."
                className="border-green-300 focus:border-green-500 dark:border-green-600 resize-none transition-all duration-200"
                rows={3}
                maxLength={500}
                required
              />
            </div>

            <div>
              <Label htmlFor="back" className="text-green-700 dark:text-green-300 flex items-center justify-between">
                <span>Back (Answer)</span>
                <span className="text-xs text-gray-500">{back.length}/500</span>
              </Label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => handleTextareaChange(e, setBack)}
                placeholder="Enter the answer or explanation..."
                className="border-green-300 focus:border-green-500 dark:border-green-600 resize-none transition-all duration-200"
                rows={3}
                maxLength={500}
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!front.trim() || !back.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingCard ? "Update Card" : "Add Card"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Quick save shortcut hint */}
        <div className="text-xs text-green-600 dark:text-green-400 text-center">Press Ctrl+Enter to quick save</div>
      </DialogContent>
    </Dialog>
  )
}
