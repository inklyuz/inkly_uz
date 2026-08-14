import { apiRequest } from "./client"
import type { CreatorMeResponse, CreatorPublicResponse, Page } from "@/types/api"

export const creatorsApi = {
  list: (params: { page?: number; page_size?: number } = {}) => {
    const q = new URLSearchParams()
    if (params.page) q.set("page", String(params.page))
    if (params.page_size) q.set("page_size", String(params.page_size))
    return apiRequest<Page<CreatorPublicResponse>>(`/creators?${q}`)
  },

  get: (username: string) => apiRequest<CreatorPublicResponse>(`/creators/${username.replace(/^@/, "")}`),

  me: (token: string) => apiRequest<CreatorMeResponse>("/creators/me", { token }),

  apply: (token: string, data: { description?: string }) =>
    apiRequest<CreatorMeResponse>("/creators/apply", { method: "POST", body: data, token }),

  updateMe: (token: string, data: { description?: string }) =>
    apiRequest<CreatorMeResponse>("/creators/me", { method: "PATCH", body: data, token }),
}

export async function listCreatorsSafe(params: { page?: number; page_size?: number } = {}): Promise<Page<CreatorPublicResponse>> {
  try {
    return await creatorsApi.list(params)
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("listCreatorsSafe error:", error)
    return { items: [], total: 0, page: params.page ?? 1, page_size: params.page_size ?? 20, pages: 0 }
  }
}
