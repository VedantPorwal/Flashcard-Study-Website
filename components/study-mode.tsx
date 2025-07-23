"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from "lucide-react"
import type { Deck, StudySession } from "@/lib/types"
import { useFlashcards } from "@/contexts/flashcard-context"

interface StudyModeProps {
  deck: Deck
  onExit: () => void
}

export default function StudyMode({ deck, onExit }: StudyModeProps) {
  const { dispatch } = useFlashcards()
  const [session, setSession] = useState<StudySession>({
    deckId: deck.id,
    currentCardIndex: 0,
    isFlipped: false,
    correctCount: 0,
    incorrectCount: 0,
  })

  const currentCard = deck.flashcards[session.currentCardIndex]
  const progress = (session.currentCardIndex / deck.flashcards.length) * 100
  const isComplete = session.currentCardIndex >= deck.flashcards.length

  const handleFlip = () => {
    setSession((prev) => ({ ...prev, isFlipped: !prev.isFlipped }))
  }

  const handleAnswer = (correct: boolean) => {
    // Update flashcard stats
    dispatch({
      type: "UPDATE_FLASHCARD_STATS",
      payload: {
        deckId: deck.id,
        flashcardId: currentCard.id,
        correct,
      },
    })

    // Update session
    setSession((prev) => ({
      ...prev,
      currentCardIndex: prev.currentCardIndex + 1,
      isFlipped: false,
      correctCount: correct ? prev.correctCount + 1 : prev.correctCount,
      incorrectCount: !correct ? prev.incorrectCount + 1 : prev.incorrectCount,
    }))
  }

  const handleRestart = () => {
    setSession({
      deckId: deck.id,
      currentCardIndex: 0,
      isFlipped: false,
      correctCount: 0,
      incorrectCount: 0,
    })
  }

  if (isComplete) {
    const accuracy = (session.correctCount / (session.correctCount + session.incorrectCount)) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              onClick={onExit}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deck
            </Button>
          </div>

          <Card className="bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">Study Session Complete!</h2>
                <p className="text-green-600 dark:text-green-300">Great job studying {deck.name}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{session.correctCount}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{session.incorrectCount}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{accuracy.toFixed(0)}%</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Accuracy</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={handleRestart} className="bg-green-600 hover:bg-green-700 text-white">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Study Again
                </Button>
                <Button
                  onClick={onExit}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 bg-transparent"
                >
                  Back to Deck
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button
            onClick={onExit}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Study
          </Button>

          <div className="text-green-700 dark:text-green-300 font-medium">
            {session.currentCardIndex + 1} of {deck.flashcards.length}
          </div>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-2 bg-green-100 dark:bg-green-900" />
        </div>

        <div className="mb-6 perspective-1000">
          <div
            className={`relative w-full min-h-[300px] cursor-pointer transform-style-preserve-3d transition-transform duration-700 ${
              session.isFlipped ? "rotate-y-180" : ""
            }`}
            onClick={handleFlip}
          >
            {/* Front of card (Question) */}
            <Card className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 shadow-xl">
              <CardContent className="p-8 flex items-center justify-center text-center h-full">
                <div className="w-full">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                      Question
                    </span>
                  </div>
                  <div className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">{currentCard.front}</div>
                  <div className="mt-6 text-sm text-green-600 dark:text-green-400">Click to reveal answer</div>
                </div>
              </CardContent>
            </Card>

            {/* Back of card (Answer) */}
            <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700 shadow-xl">
              <CardContent className="p-8 flex items-center justify-center text-center h-full">
                <div className="w-full">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                      Answer
                    </span>
                  </div>
                  <div className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">{currentCard.back}</div>
                  <div className="mt-6 text-sm text-emerald-600 dark:text-emerald-400">Click to flip back</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {session.isFlipped && (
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => handleAnswer(false)}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
              size="lg"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Didn't Know
            </Button>
            <Button onClick={() => handleAnswer(true)} className="bg-green-600 hover:bg-green-700 text-white" size="lg">
              <CheckCircle className="w-5 h-5 mr-2" />
              Know It
            </Button>
          </div>
        )}

        <div className="mt-6 flex justify-center gap-6 text-sm text-green-600 dark:text-green-400">
          <div>Correct: {session.correctCount}</div>
          <div>Incorrect: {session.incorrectCount}</div>
        </div>
      </div>
    </div>
  )
}
