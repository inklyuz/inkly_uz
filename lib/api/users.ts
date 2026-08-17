import { apiRequest } from "./client"
import type { UserMeResponse, UserPublicResponse } from "@/types/api"

export const usersApi = {
  // Public profil
  getPublic: (username: string) =>
    apiRequest<UserPublicResponse>(`/users/${username.replace(/^@/, "")}`, { revalidate: 0 }),

  // O'z profili (auth kerak)
  getMe: (token: string) =>
    apiRequest<UserMeResponse>("/users/me", { token }),

  // Profilni yangilash — faqat yuborilgan fieldlar o'zgaradi (PATCH semantics)
  // Backend UserUpdate schema:
  //   full_name, username, slug, bio, avatar, cover, website, location,
  //   telegram_username, instagram_username, youtube_username, github_username, twitter_username
  updateMe: (
    token: string,
    data: Partial<{
      full_name: string
      username: string
      slug: string
      bio: string | null
      avatar: string | null      // relative path: "avatars/abc.webp"
      cover: string | null       // relative path: "covers/abc.webp"
      website: string | null
      location: string | null
      telegram_username: string | null
      instagram_username: string | null
      youtube_username: string | null
      github_username: string | null
      twitter_username: string | null
    }>,
  ) => apiRequest<UserMeResponse>("/users/me", { method: "PATCH", body: data, token }),

  // Parol o'zgartirish
  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    apiRequest<void>("/users/me/password", {
      method: "POST",
      body: { current_password: currentPassword, new_password: newPassword },
      token,
    }),

  // Email o'zgartirish — 2 qadam
  requestEmailChange: (token: string, newEmail: string) =>
    apiRequest<void>("/users/me/email", {
      method: "POST",
      body: { new_email: newEmail },
      token,
    }),

  verifyEmailChange: (token: string, code: string) =>
    apiRequest<void>("/users/me/email/verify", {
      method: "POST",
      body: { code },
      token,
    }),

  // Username mavjudligini tekshirish (real-time, debounce bilan chaqiring)
  checkUsername: (username: string) =>
    apiRequest<{ username: string; available: boolean }>(`/users/check?username=${encodeURIComponent(username)}`),

  // Hisobni o'chirish
  deleteMe: (token: string) =>
    apiRequest<void>("/users/me", { method: "DELETE", token }),
}

export async function getUserSafe(username: string): Promise<UserPublicResponse | null> {
  const clean = username.replace(/^@/, "").toLowerCase()
  try {
    return await usersApi.getPublic(clean)
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("getUserSafe error:", error)
    return null
  }
}
