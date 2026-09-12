"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react"
import { authApi } from "@/lib/api/auth"
import {
  getStoredAccessToken,
  setStoredAccessToken,
  clearStoredAccessToken,
} from "@/lib/api/client"
import type { TokenPair, UserMeResponse } from "@/types/api"

const EXPIRES_KEY = "inkly_token_expires_at"
const LOGOUT_EVENT_KEY = "inkly_logout_at"

// Backend endi refresh_token ni httpOnly cookie sifatida to'g'ri o'rnatadi
// (backend tuzatildi). Middleware ham xuddi shu "refresh_token" cookie ni tekshiradi.
// Eski "has_session" marker endi kerak emas — httpOnly cookie o'zi yetarli.
// Lekin: httpOnly cookie JS tomonidan o'qilmaydi — faqat backend o'rnatadi/o'chiradi.
// Cookie nomi: inkly_refresh (backend config.py: refresh_cookie_name = "inkly_refresh").
// Logout'da backend /auth/logout ni chaqiramiz, u cookie ni o'chiradi.
// setSessionMarker/clearSessionMarker — endi bo'sh funksiyalar (backward compat).
function setSessionMarker(): void {
  // No-op: backend httpOnly refresh_token cookie ni o'zi boshqaradi
}

function clearSessionMarker(): void {
  // No-op: backend httpOnly refresh_token cookie ni o'zi boshqaradi
}

function clearToken(): void {
  clearStoredAccessToken()
  clearSessionMarker()
  if (typeof window !== "undefined") sessionStorage.removeItem(EXPIRES_KEY)
}

function setTokenExpiry(expiresIn: number): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(EXPIRES_KEY, String(Date.now() + expiresIn * 1000))
}

function getRemainingTokenLifetime(): number | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(EXPIRES_KEY)
  if (!raw) return null
  const expiresAt = Number(raw)
  if (!Number.isFinite(expiresAt)) return null
  return (expiresAt - Date.now()) / 1000
}

// ─── Sinxron initial loading holati ────────────────────────────────────────
// sessionStorage ni SSR-safe sinxron tekshiramiz.
// Token bor  → loading: true  (async tasdiqlash kerak, lekin token mavjud)
// Token yo'q → loading: false (darhol: bu foydalanuvchi login qilmagan)
//
// Bu "flicker" muammosini hal qiladi:
// Login qilmagan foydalanuvchilar uchun Navbar, FollowButton, PostActions
// hech qachon "yuklanyapti" holatida ko'rinmaydi — darhol to'g'ri holat.
function getInitialLoading(): boolean {
  if (typeof window === "undefined") return false
  return Boolean(getStoredAccessToken())
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
    // sessionStorage sinxron tekshiruvi — SSR da false, client da token bor/yo'qligiga qarab
    loading: getInitialLoading(),
    error: null,
  })

  // Race condition oldini olish: parallel refresh chaqiruvlarida faqat bitta ishlaydi
  const refreshingRef = useRef<Promise<void> | null>(null)

  // Timer ref — eskisini bekor qilmay yangi timer qo'shmaslik uchun
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // refresh funksiyasiga ref — circular dependency'siz proaktiv rejalashtirish uchun
  const refreshRef = useRef<() => Promise<void>>(async () => {})

  const cancelRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  // Proaktiv token yangilash: muddat 80% o'tganda yangi token so'raladi.
  // refreshRef orqali chaqiramiz — circular dependency yo'q.
  const scheduleProactiveRefresh = useCallback(
    (expiresIn: number) => {
      cancelRefreshTimer()
      const delay = Math.max(10_000, expiresIn * 0.8 * 1000)
      refreshTimerRef.current = setTimeout(() => {
        refreshRef.current()
      }, delay)
    },
    [cancelRefreshTimer]
  )

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return refreshingRef.current

    const operation = (async () => {
      const stored = getStoredAccessToken()

      // 1. Mavjud access token bilan sinab ko'rish
      if (stored) {
        try {
          const user = await authApi.me(stored)
          dispatch({ type: "SET_USER", user, token: stored })
          const remaining = getRemainingTokenLifetime()
          if (remaining !== null && remaining > 0) {
            scheduleProactiveRefresh(remaining)
          }
          return
        } catch {
          // Access token eskirgan — refresh token bilan yangilaymiz
        }
      }

      // 2. httpOnly cookie'dagi refresh token bilan yangi juft olamiz
      try {
        const { tokens } = await authApi.refresh()
        const user = await authApi.me(tokens.access_token)
        setStoredAccessToken(tokens.access_token)
        setTokenExpiry(tokens.expires_in)
        setSessionMarker()
        dispatch({ type: "SET_USER", user, token: tokens.access_token })
        scheduleProactiveRefresh(tokens.expires_in)
      } catch {
        // Refresh token ham yaroqsiz — foydalanuvchini chiqaramiz
        clearToken()
        cancelRefreshTimer()
        dispatch({ type: "LOGOUT" })
      }
    })()

    refreshingRef.current = operation
    try {
      await operation
    } finally {
      if (refreshingRef.current === operation) refreshingRef.current = null
    }
  }, [scheduleProactiveRefresh, cancelRefreshTimer])

  // refreshRef ni har doim yangilab turamiz
  useEffect(() => {
    refreshRef.current = refresh
  }, [refresh])

  // Ilk yuklashda faqat mavjud access token bo'lsa sessiyani tekshiramiz.
  // Anonymous public sahifalarda /auth/refresh ga keraksiz 401 so'rov yubormaymiz.
  // Bu har bir public page ochilishidagi ortiqcha network wait'ni olib tashlaydi.
  useEffect(() => {
    if (getStoredAccessToken()) {
      void refresh()
    }
    return () => cancelRefreshTimer()
  }, [refresh, cancelRefreshTimer])

  // Boshqa tab/oynada logout bo'lganda ushbu tab ham chiqsin
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOGOUT_EVENT_KEY) {
        clearToken()
        cancelRefreshTimer()
        dispatch({ type: "LOGOUT" })
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [cancelRefreshTimer])

  const login = useCallback(
    async (pair: TokenPair) => {
      setStoredAccessToken(pair.access_token)
      if (pair.expires_in) setTokenExpiry(pair.expires_in)
      try {
        const user = await authApi.me(pair.access_token)
        // MUHIM: middleware'ning /dashboard kabi himoyalangan sahifalarni
        // bloklamasligi uchun shu marker cookie shart. Backend refresh_token'ni
        // httpOnly cookie sifatida yubormagani uchun bu yerda o'zimiz qo'yamiz.
        setSessionMarker()
        dispatch({ type: "SET_USER", user, token: pair.access_token })
        if (pair.expires_in) scheduleProactiveRefresh(pair.expires_in)
      } catch {
        clearToken()
        dispatch({ type: "LOGOUT" })
        throw new Error("Sessiya tiklanmadi")
      }
    },
    [scheduleProactiveRefresh]
  )

  const logout = useCallback(async () => {
    const token = getStoredAccessToken() ?? undefined
    if (token) await authApi.logout(token).catch(() => {})
    clearToken()
    cancelRefreshTimer()
    localStorage.setItem(LOGOUT_EVENT_KEY, String(Date.now()))
    dispatch({ type: "LOGOUT" })
  }, [cancelRefreshTimer])

  return (
    <AuthContext.Provider
      value={{ state, isAuthenticated: Boolean(state.user), login, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}