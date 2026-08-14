import { apiRequest } from "./client"
import type { CategoryPublicResponse, Page } from "@/types/api"

export const categoriesApi = {
  list: () => apiRequest<Page<CategoryPublicResponse>>("/categories?page_size=50"),
  get: (slug: string) => apiRequest<CategoryPublicResponse>(`/categories/${slug}`),
  getPosts: (slug: string, params: { page?: number; page_size?: number } = {}) => {
    const q = new URLSearchParams()
    if (params.page) q.set("page", String(params.page))
    if (params.page_size) q.set("page_size", String(params.page_size))
    return apiRequest<Page<any>>(`/categories/${slug}/posts?${q}`)
  },
}

export async function listCategoriesSafe(): Promise<Page<CategoryPublicResponse>> {
  try {
    return await categoriesApi.list()
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("listCategoriesSafe error:", error)
    return { items: [], total: 0, page: 1, page_size: 50, pages: 0 }
  }
}

export async function getCategorySafe(slug: string): Promise<CategoryPublicResponse | null> {
  try {
    return await categoriesApi.get(slug)
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("getCategorySafe error:", error)
    return null
  }
}
