import { apiRequest } from "./client"
import type { UserMeResponse, UserPublicResponse } from "@/types/api"

export const usersApi = {
  getPublic: (username: string) => apiRequest<UserPublicResponse>(`/users/${username.replace(/^@/, "")}`, { revalidate: 0 }),

  updateMe: (
    token: string,
    data: Partial<{
      full_name: string
      username: string
      bio: string
      website: string
      location: string
      socials: Record<string, string | null>
    }>,
  ) => apiRequest<UserMeResponse>("/users/me", { method: "PATCH", body: data, token }),
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
