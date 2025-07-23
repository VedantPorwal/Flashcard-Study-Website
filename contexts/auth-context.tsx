"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { User, AuthState } from "@/lib/types"
import { getSession, saveSession } from "@/lib/auth"

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: User }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }

    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      }

    default:
      return state
  }
}

const AuthContext = createContext<{
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
} | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const checkSession = () => {
      const user = getSession()
      if (user) {
        dispatch({ type: "LOGIN_SUCCESS", payload: user })
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    checkSession()
  }, [])

  useEffect(() => {
    if (state.user) {
      saveSession(state.user)
    }
  }, [state.user])

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
