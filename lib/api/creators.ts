import { apiRequest, withFallback } from "./client"
import { demoCreators, paginate } from "@/lib/demo/data"
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
}

export function listCreatorsSafe(params: { page?: number; page_size?: number } = {}): Promise<Page<CreatorPublicResponse>> {
  return withFallback(() => creatorsApi.list(params), paginate(demoCreators, params.page ?? 1, params.page_size ?? 20))
}
