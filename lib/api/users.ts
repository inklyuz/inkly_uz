import { apiRequest, withFallback } from "./client"
import { demoUsers } from "@/lib/demo/data"
import type { UserMeResponse, UserPublicResponse } from "@/types/api"

export const usersApi = {
  getPublic: (username: string) => apiRequest<UserPublicResponse>(`/users/${username.replace(/^@/, "")}`),

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

export function getUserSafe(username: string): Promise<UserPublicResponse | null> {
  const clean = username.replace(/^@/, "").toLowerCase()
  return withFallback(() => usersApi.getPublic(clean), demoUsers[clean] ?? null)
}
