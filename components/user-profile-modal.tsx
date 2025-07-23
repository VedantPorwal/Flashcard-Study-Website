"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Save, User, Mail, Calendar, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { updateUserProfile } from "@/lib/auth"

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { state, dispatch } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (state.user) {
      setName(state.user.name)
      setEmail(state.user.email)
    }
  }, [state.user])

  const hasChanges = state.user && (name !== state.user.name || email !== state.user.email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.user || !hasChanges) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await updateUserProfile(state.user.id, { name, email })

      if (result.success && result.user) {
        dispatch({ type: "UPDATE_USER", payload: result.user })
        setSuccess("Profile updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(result.error || "Failed to update profile")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!state.user) return null

  const initials = state.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
        <DialogHeader>
          <DialogTitle className="text-green-800 dark:text-green-200">Profile Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-20 w-20 border-4 border-green-200 dark:border-green-700 mb-3">
            <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="font-semibold text-green-800 dark:text-green-200">{state.user.name}</h3>
            <p className="text-sm text-green-600 dark:text-green-300">{state.user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="name" className="text-green-700 dark:text-green-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-green-300 focus:border-green-500 dark:border-green-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-green-700 dark:text-green-300 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-green-300 focus:border-green-500 dark:border-green-600"
              required
            />
          </div>

          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Calendar className="w-4 h-4" />
              <span>Member since {state.user.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 mt-1">
              <span>Last login: {state.user.lastLogin.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
