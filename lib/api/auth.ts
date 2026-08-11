import { apiRequest } from "./client"
import type { SessionOut, TelegramStartResponse, TokenPair, UserMeResponse } from "@/types/api"

export const authApi = {
  // Email/parol
  register: (data: { email: string; password: string; full_name: string }) =>
    apiRequest<{ user: UserMeResponse; tokens: TokenPair }>("/auth/register", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    apiRequest<TokenPair>("/auth/login", { method: "POST", body: data }),

  logout: (token: string) => apiRequest<void>("/auth/logout", { method: "POST", token }),

  refresh: () => apiRequest<TokenPair>("/auth/refresh", { method: "POST" }),

  me: (token: string) => apiRequest<UserMeResponse>("/auth/me", { token }),

  // Email tasdiqlash
  verifyEmail: (code: string) => apiRequest<void>("/auth/verify-email", { method: "POST", body: { code } }),

  resendVerification: (email: string) =>
    apiRequest<void>("/auth/verify-email/resend", { method: "POST", body: { email } }),

  // Parol tiklash
  forgotPassword: (email: string) => apiRequest<void>("/auth/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (data: { email: string; code: string; new_password: string }) =>
    apiRequest<void>("/auth/reset-password", { method: "POST", body: data }),

  // Telegram login (bot flow)
  telegramStart: () => apiRequest<TelegramStartResponse>("/auth/telegram/start", { method: "POST" }),

  telegramVerify: (data: { verification_id: string; token: string }) =>
    apiRequest<TokenPair>("/auth/telegram/verify", { method: "POST", body: data }),

  // Google OAuth
  getGoogleUrl: () => apiRequest<{ authorization_url: string; state: string }>("/auth/google"),

  // Sessiyalar
  getSessions: (token: string) => apiRequest<SessionOut[]>("/auth/sessions", { token }),

  deleteSession: (token: string, sessionId: string) =>
    apiRequest<void>(`/auth/sessions/${sessionId}`, { method: "DELETE", token }),
}
