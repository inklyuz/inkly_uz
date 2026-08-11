import { apiRequest, withFallback } from "./client"
import { demoCategories, paginate } from "@/lib/demo/data"
import type { CategoryPublicResponse, Page } from "@/types/api"

export const categoriesApi = {
  list: () => apiRequest<Page<CategoryPublicResponse>>("/categories?page_size=50"),
  get: (slug: string) => apiRequest<CategoryPublicResponse>(`/categories/${slug}`),
}

export function listCategoriesSafe(): Promise<Page<CategoryPublicResponse>> {
  return withFallback(() => categoriesApi.list(), paginate(demoCategories, 1, 50))
}

export function getCategorySafe(slug: string): Promise<CategoryPublicResponse | null> {
  return withFallback(() => categoriesApi.get(slug), demoCategories.find((c) => c.slug === slug) ?? null)
}
