"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, CheckCircle } from "lucide-react"
import type { Deck } from "@/lib/types"

interface CreateDeckModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (deck: Omit<Deck, "id" | "createdAt">) => void
  editingDeck?: Deck
}

export default function CreateDeckModal({ isOpen, onClose, onSave, editingDeck }: CreateDeckModalProps) {
  const [name, setName] = useState(editingDeck?.name || "")
  const [description, setDescription] = useState(editingDeck?.description || "")
  const [isValid, setIsValid] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Real-time validation
  useEffect(() => {
    setIsValid(name.trim().length >= 2)
  }, [name])

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = editingDeck
      ? name !== editingDeck.name || description !== editingDeck.description
      : name.trim() !== "" || description.trim() !== ""
    setHasUnsavedChanges(hasChanges)
  }, [name, description, editingDeck])

  // Auto-save draft
  useEffect(() => {
    if (!editingDeck && (name.trim() || description.trim())) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("deck-draft", JSON.stringify({ name, description }))
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [name, description, editingDeck])

  // Load draft on mount
  useEffect(() => {
    if (!editingDeck && isOpen) {
      const draft = localStorage.getItem("deck-draft")
      if (draft) {
        try {
          const { name: draftName, description: draftDescription } = JSON.parse(draft)
          setName(draftName || "")
          setDescription(draftDescription || "")
        } catch (error) {
          console.error("Failed to load draft:", error)
        }
      }
    }
  }, [editingDeck, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      description: description.trim(),
      flashcards: editingDeck?.flashcards || [],
      lastStudied: editingDeck?.lastStudied,
    })

    // Clear draft after successful save
    localStorage.removeItem("deck-draft")

    if (!editingDeck) {
      setName("")
      setDescription("")
    }
    setHasUnsavedChanges(false)
    onClose()
  }

  const handleClose = () => {
    if (!editingDeck) {
      setName("")
      setDescription("")
    }
    onClose()
  }

  // Auto-resize description textarea
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    setDescription(textarea.value)

    // Auto-resize
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
        <DialogHeader>
          <DialogTitle className="text-green-800 dark:text-green-200 flex items-center justify-between">
            <span>{editingDeck ? "Edit Deck" : "Create New Deck"}</span>
            {hasUnsavedChanges && <span className="text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-green-700 dark:text-green-300 flex items-center justify-between">
              <span>Deck Name</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{name.length}/50</span>
                {isValid && <CheckCircle className="w-3 h-3 text-green-500" />}
              </div>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter deck name..."
              className={`border-green-300 focus:border-green-500 dark:border-green-600 transition-all duration-200 ${
                isValid ? "border-green-500" : name.length > 0 ? "border-amber-400" : ""
              }`}
              maxLength={50}
              required
            />
            {name.length > 0 && name.length < 2 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Name must be at least 2 characters</p>
            )}
          </div>

          <div>
            <Label
              htmlFor="description"
              className="text-green-700 dark:text-green-300 flex items-center justify-between"
            >
              <span>Description (optional)</span>
              <span className="text-xs text-gray-500">{description.length}/200</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter deck description..."
              className="border-green-300 focus:border-green-500 dark:border-green-600 resize-none transition-all duration-200"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
              disabled={!isValid}
            >
              <Save className="w-4 h-4 mr-2" />
              {editingDeck ? "Update Deck" : "Create Deck"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 bg-transparent transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Quick save hint */}
        <div className="text-xs text-green-600 dark:text-green-400 text-center">Press Ctrl+Enter to quick save</div>
      </DialogContent>
    </Dialog>
  )
}
