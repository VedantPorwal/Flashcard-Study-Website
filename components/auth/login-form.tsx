"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { login } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { dispatch } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login({ email, password })

      if (result.success && result.user) {
        dispatch({ type: "LOGIN_SUCCESS", payload: result.user })
      } else {
        setError(result.error || "Login failed")
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
        <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">Welcome Back</CardTitle>
        <p className="text-green-600 dark:text-green-300">Sign in to your account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="email" className="text-green-700 dark:text-green-300">
              Email
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
            <Label htmlFor="password" className="text-green-700 dark:text-green-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-green-600 dark:text-green-300">
              Don't have an account?{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-green-700 dark:text-green-200 font-semibold"
                onClick={onSwitchToRegister}
              >
                Sign up
              </Button>
            </p>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">Demo Account:</p>
          <p className="text-xs text-green-600 dark:text-green-400">Email: demo@example.com</p>
          <p className="text-xs text-green-600 dark:text-green-400">Password: demo123</p>
        </div>
      </CardContent>
    </Card>
  )
}
