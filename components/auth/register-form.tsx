"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, UserPlus, CheckCircle } from "lucide-react"
import { register } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { dispatch } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const passwordStrength = {
    length: password.length >= 6,
    match: password === confirmPassword && password.length > 0,
  }

  const isFormValid =
    name.trim().length >= 2 && email.includes("@") && passwordStrength.length && passwordStrength.match

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    setError("")

    try {
      const result = await register({ name, email, password })

      if (result.success && result.user) {
        dispatch({ type: "LOGIN_SUCCESS", payload: result.user })
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">Create Account</CardTitle>
        <p className="text-green-600 dark:text-green-300">Join Flashcard Study today</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="name" className="text-green-700 dark:text-green-300 flex items-center justify-between">
              <span>Full Name</span>
              {name.length >= 2 && <CheckCircle className="w-3 h-3 text-green-500" />}
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="border-green-300 focus:border-green-500 dark:border-green-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-green-700 dark:text-green-300 flex items-center justify-between">
              <span>Email</span>
              {email.includes("@") && <CheckCircle className="w-3 h-3 text-green-500" />}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="border-green-300 focus:border-green-500 dark:border-green-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-green-700 dark:text-green-300 flex items-center justify-between">
              <span>Password</span>
              {passwordStrength.length && <CheckCircle className="w-3 h-3 text-green-500" />}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="border-green-300 focus:border-green-500 dark:border-green-600 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            <div className="mt-1 space-y-1">
              <div
                className={`text-xs flex items-center gap-1 ${passwordStrength.length ? "text-green-600" : "text-gray-500"}`}
              >
                <div className={`w-1 h-1 rounded-full ${passwordStrength.length ? "bg-green-500" : "bg-gray-300"}`} />
                At least 6 characters
              </div>
            </div>
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-green-700 dark:text-green-300 flex items-center justify-between"
            >
              <span>Confirm Password</span>
              {passwordStrength.match && <CheckCircle className="w-3 h-3 text-green-500" />}
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="border-green-300 focus:border-green-500 dark:border-green-600"
              required
            />
            {confirmPassword && !passwordStrength.match && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Passwords don't match</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </div>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-green-600 dark:text-green-300">
              Already have an account?{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-green-700 dark:text-green-200 font-semibold"
                onClick={onSwitchToLogin}
              >
                Sign in
              </Button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
