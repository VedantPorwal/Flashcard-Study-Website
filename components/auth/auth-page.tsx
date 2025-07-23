"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-green-600" />
            <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Flashcard Study</h1>
          </div>
          <p className="text-green-600 dark:text-green-300">Your personal study companion for mastering any subject</p>
        </div>

        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}
