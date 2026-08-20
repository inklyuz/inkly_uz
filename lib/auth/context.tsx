"use client"

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, type ReactNode } from "react"
import { authApi } from "@/lib/api/auth"
import type { TokenPair, UserMeResponse } from "@/types/api"

// XAVFSIZLIK: access token faqat sessionStorage'da turadi.
// Refresh token httpOnly cookie orqali backend tomonidan boshqariladi.
// TODO (backend o'zgarishi kerak): access token butunlay httpOnly cookie'ga o'tkazilishi kerak.
const TOKEN_KEY = "inkly_token"
const LOGOUT_EVENT_KEY = "inkly_logout_at"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem(TOKEN_KEY)
}

function setToken(token: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(TOKEN_KEY, token)
}

function clearToken(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(TOKEN_KEY)
}

interface AuthState {
  user: UserMeResponse | null
  token: string | null
  loading: boolean
  error: string | null
}

type AuthAction =
  | { type: "SET_USER"; user: UserMeResponse; token: string }
  | { type: "LOGOUT" }
  | { type: "LOADING"; loading: boolean }

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return { user: action.user, token: action.token, loading: false, error: null }
    case "LOGOUT":
      return { user: null, token: null, loading: false, error: null }
    case "LOADING":
      return { ...state, loading: action.loading }
    default:
      return state
  }
}

const AuthContext = createContext<{
  state: AuthState
  isAuthenticated: boolean
  login: (pair: TokenPair) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
} | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    token: null,
    loading: true,
    error: null,
  })
  // Race condition oldini olish: parallel refresh chaqiruvlarida faqat bitta ishlaydi
  const refreshingRef = useRef(false)

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return
    refreshingRef.current = true

    try {
      const stored = getToken()

      // 1. Saqlangan token mavjud bo'lsa — uni sinab ko'ramiz
      if (stored) {
        try {
          const user = await authApi.me(stored)
          dispatch({ type: "SET_USER", user, token: stored })
          return
        } catch {
          // Token muddati o'tgan yoki yaroqsiz — cookie orqali yangilashga urinamiz
        }
      }

      // 2. httpOnly cookie dagi refresh_token orqali yangi access_token olamiz
      try {
        const { tokens } = await authApi.refresh()
        const user = await authApi.me(tokens.access_token)
        setToken(tokens.access_token)
        dispatch({ type: "SET_USER", user, token: tokens.access_token })
      } catch {
        clearToken()
        dispatch({ type: "LOGOUT" })
      }
    } finally {
      refreshingRef.current = false
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOGOUT_EVENT_KEY) {
        clearToken()
        dispatch({ type: "LOGOUT" })
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const login = useCallback(async (pair: TokenPair) => {
    setToken(pair.access_token)
    try {
      const user = await authApi.me(pair.access_token)
      dispatch({ type: "SET_USER", user, token: pair.access_token })
    } catch {
      clearToken()
      dispatch({ type: "LOGOUT" })
      throw new Error("Sessiya tiklanmadi")
    }
  }, [])

  const logout = useCallback(async () => {
    const token = getToken() ?? undefined
    if (token) await authApi.logout(token).catch(() => {})
    clearToken()
    localStorage.setItem(LOGOUT_EVENT_KEY, String(Date.now()))
    dispatch({ type: "LOGOUT" })
  }, [])

  return (
    <AuthContext.Provider value={{ state, isAuthenticated: Boolean(state.user), login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
