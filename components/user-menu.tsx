"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, LogOut, Moon, Sun } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useFlashcards } from "@/contexts/flashcard-context"
import { clearSession } from "@/lib/auth"
import UserProfileModal from "./user-profile-modal"

export default function UserMenu() {
  const { state: authState, dispatch: authDispatch } = useAuth()
  const { state: flashcardState, dispatch: flashcardDispatch } = useFlashcards()
  const [showProfile, setShowProfile] = useState(false)

  const handleLogout = () => {
    clearSession()
    authDispatch({ type: "LOGOUT" })
  }

  const toggleTheme = () => {
    flashcardDispatch({ type: "TOGGLE_THEME" })
  }

  if (!authState.user) return null

  const initials = authState.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-green-200 dark:border-green-700">
              <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{authState.user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{authState.user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfile(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleTheme}>
            {flashcardState.theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
            <span>{flashcardState.theme === "light" ? "Dark mode" : "Light mode"}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  )
}
