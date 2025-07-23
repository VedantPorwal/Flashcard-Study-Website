import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FlashcardProvider } from "@/contexts/flashcard-context"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Flashcard Study App",
  description: "Create, manage, and study flashcards organized by decks",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FlashcardProvider>{children}</FlashcardProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
