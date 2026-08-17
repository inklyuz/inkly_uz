import { apiRequest } from "./client"
import type { SessionOut, TokenPair, UserMeResponse } from "@/types/api"

export const authApi = {
  // ── Ro'yxatdan o'tish (2-qadam) ──────────────────────────────────────────
  // Qadam 1: foydalanuvchi yaratiladi, emailga OTP yuboriladi — token BERMAYDI
  register: (data: { email: string; password: string; full_name: string; username?: string }) =>
    apiRequest<{ message: string; email: string }>("/auth/register", { method: "POST", body: data }),

  // Qadam 2: OTP tasdiqlash → token qaytaradi
  confirmRegistration: (data: { email: string; code: string }) =>
    apiRequest<{ tokens: TokenPair }>("/auth/register/confirm", { method: "POST", body: data }),

  // OTP qayta yuborish
  resendVerification: (email: string) =>
    apiRequest<void>("/auth/register/resend", { method: "POST", body: { email } }),

  // ── Login ─────────────────────────────────────────────────────────────────
  login: (data: { email: string; password: string }) =>
    apiRequest<{ tokens: TokenPair }>("/auth/login", { method: "POST", body: data }),

  logout: (token: string) =>
    // refresh_token httpOnly cookie da saqlanadi — backend o'zi o'qiydi
    apiRequest<void>("/auth/logout", { method: "POST", body: {}, token }),

  refresh: () =>
    apiRequest<{ tokens: TokenPair }>("/auth/refresh", { method: "POST", body: { refresh_token: "" } }),

  // ── Foydalanuvchi ma'lumotlari ─────────────────────────────────────────────
  // MUHIM: /auth/me endpoint yo'q! /users/me ishlatiladi
  me: (token: string) => apiRequest<UserMeResponse>("/users/me", { token }),

  // ── Parol tiklash ─────────────────────────────────────────────────────────
  forgotPassword: (email: string) =>
    apiRequest<void>("/auth/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (data: { email: string; code: string; new_password: string }) =>
    apiRequest<void>("/auth/reset-password", { method: "POST", body: data }),

  // ── Google OAuth ──────────────────────────────────────────────────────────
  // GET /auth/google → { authorization_url, state }
  getGoogleUrl: () =>
    apiRequest<{ authorization_url: string; state: string }>("/auth/google"),

  // Google redirect qaytganda — backend callback endpointi
  // Frontend /auth/google/callback route da bu chaqiriladi
  googleCallback: (code: string, state: string) =>
    apiRequest<{ tokens: TokenPair }>(`/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`),

  // ── Telegram Widget login ─────────────────────────────────────────────────
  // Telegram Login Widget ma'lumotlarini yuborish
  telegramLogin: (data: {
    id: number
    first_name: string
    last_name?: string | null
    username?: string | null
    photo_url?: string | null
    auth_date: number
    hash: string
  }) => apiRequest<{ tokens: TokenPair }>("/auth/telegram", { method: "POST", body: data }),

  // ── Provider ulash / uzish ────────────────────────────────────────────────
  linkGoogleStart: (token: string) =>
    apiRequest<{ authorization_url: string; state: string }>("/auth/link/google", { token }),

  linkGoogleCallback: (token: string, code: string, state: string) =>
    apiRequest<void>(`/auth/link/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, { token }),

  unlinkProvider: (token: string, provider: "google" | "telegram") =>
    apiRequest<void>(`/auth/link/${provider}`, { method: "DELETE", token }),

  // ── Sessiyalar ────────────────────────────────────────────────────────────
  getSessions: (token: string) =>
    apiRequest<SessionOut[]>("/auth/sessions", { token }),

  deleteOtherSessions: (token: string) =>
    apiRequest<void>("/auth/sessions/others", { method: "DELETE", token }),

  deleteSession: (token: string, sessionId: string) =>
    apiRequest<void>(`/auth/sessions/${sessionId}`, { method: "DELETE", token }),
}