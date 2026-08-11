"use client"

import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from "react"
import { authApi } from "@/lib/api/auth"
import type { TokenPair, UserMeResponse } from "@/types/api"

const TOKEN_KEY = "inkly_token"

interface AuthState {
  user: UserMeResponse | null
  token: string | null
  loading: boolean
}

type AuthAction =
  | { type: "SET_USER"; user: UserMeResponse; token: string }
  | { type: "LOGOUT" }
  | { type: "LOADING"; loading: boolean }

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return { user: action.user, token: action.token, loading: false }
    case "LOGOUT":
      return { user: null, token: null, loading: false }
    case "LOADING":
      return { ...state, loading: action.loading }
    default:
      return state
  }
}

const AuthContext = createContext<{
  state: AuthState
  login: (pair: TokenPair) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
} | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, token: null, loading: true })

  const refresh = useCallback(async () => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
      if (stored) {
        const user = await authApi.me(stored)
        dispatch({ type: "SET_USER", user, token: stored })
        return
      }
      const pair = await authApi.refresh()
      const user = await authApi.me(pair.access_token)
      localStorage.setItem(TOKEN_KEY, pair.access_token)
      dispatch({ type: "SET_USER", user, token: pair.access_token })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      dispatch({ type: "LOGOUT" })
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (pair: TokenPair) => {
    const user = await authApi.me(pair.access_token)
    localStorage.setItem(TOKEN_KEY, pair.access_token)
    dispatch({ type: "SET_USER", user, token: pair.access_token })
  }, [])

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY) ?? undefined
    if (token) await authApi.logout(token).catch(() => {})
    localStorage.removeItem(TOKEN_KEY)
    dispatch({ type: "LOGOUT" })
  }, [])

  return <AuthContext.Provider value={{ state, login, logout, refresh }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
