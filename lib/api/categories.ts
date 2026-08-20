import { apiRequest } from "./client"
import { createSafePageWrapper, createSafeItemWrapper } from "./safe-wrapper"
import type { CategoryPublicResponse, Page, PostListItem } from "@/types/api"

export const categoriesApi = {
  list: (params: { page?: number; page_size?: number; search?: string } = {}) => {
    const q = new URLSearchParams()
    q.set("page_size", String(params.page_size ?? 50))
    if (params.page) q.set("page", String(params.page))
    if (params.search) q.set("search", params.search)
    return apiRequest<Page<CategoryPublicResponse>>(`/categories?${q}`)
  },

  get: (slug: string) =>
    apiRequest<CategoryPublicResponse>(`/categories/${slug}`),

  getPosts: (slug: string, params: { page?: number; page_size?: number } = {}) => {
    const q = new URLSearchParams()
    if (params.page) q.set("page", String(params.page))
    if (params.page_size) q.set("page_size", String(params.page_size))
    return apiRequest<Page<PostListItem>>(`/categories/${slug}/posts?${q}`)
  },
}

// ── Server component uchun safe o'ramlar (unified pattern) ──────────────────

export const listCategoriesSafe = createSafePageWrapper(
  (params: { page?: number; page_size?: number; search?: string } = {}) => categoriesApi.list(params),
  50,
  { errorPrefix: "CATEGORIES_LIST" }
)

export const getCategorySafe = createSafeItemWrapper(
  (slug: string) => categoriesApi.get(slug),
  { errorPrefix: "CATEGORY_GET" }
)

export const getCategoryPostsSafe = createSafePageWrapper(
  (slug: string, params: { page?: number; page_size?: number } = {}) => categoriesApi.getPosts(slug, params),
  20,
  { errorPrefix: "CATEGORY_POSTS" }
)
