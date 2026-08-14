import { apiRequest } from "./client"
import type { CategoryPublicResponse, Page } from "@/types/api"

export const categoriesApi = {
  list: () => apiRequest<Page<CategoryPublicResponse>>("/categories?page_size=50"),
  get: (slug: string) => apiRequest<CategoryPublicResponse>(`/categories/${slug}`),
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
