import { apiRequest } from "./client"
import type {
  CommentResponse,
  Page,
  PostListItem,
  PostReactionResponse,
  PostResponse,
  PostStatsResponse,
} from "@/types/api"

export interface ListPostsParams {
  page?: number
  page_size?: number
  author?: string
  category?: string
  search?: string
}

function buildQuery(params: ListPostsParams) {
  const q = new URLSearchParams()
  if (params.page) q.set("page", String(params.page))
  if (params.page_size) q.set("page_size", String(params.page_size))
  if (params.author) q.set("author", params.author)
  if (params.category) q.set("category", params.category)
  if (params.search) q.set("search", params.search)
  return q.toString()
}

export const postsApi = {
  // ── Ochiq endpointlar ────────────────────────────────────────────────────
  list: (params: ListPostsParams = {}) => apiRequest<Page<PostListItem>>(`/posts?${buildQuery(params)}`),

  get: (slug: string, token?: string) => apiRequest<PostResponse>(`/posts/${slug}`, { token }),

  getStats: (slug: string, token: string) => apiRequest<PostStatsResponse>(`/posts/${slug}/stats`, { token }),

  like: (slug: string, token: string) => apiRequest<PostReactionResponse>(`/posts/${slug}/like`, { method: "POST", token }),

  dislike: (slug: string, token: string) =>
    apiRequest<PostReactionResponse>(`/posts/${slug}/dislike`, { method: "POST", token }),

  removeReaction: (slug: string, token: string) =>
    apiRequest<PostReactionResponse>(`/posts/${slug}/reaction`, { method: "DELETE", token }),

  getComments: (slug: string) => apiRequest<Page<CommentResponse>>(`/posts/${slug}/comments`),

  addComment: (slug: string, content: string, token: string) =>
    apiRequest<CommentResponse>(`/posts/${slug}/comments`, { method: "POST", body: { content }, token }),

  deleteComment: (slug: string, commentUuid: string, token: string) =>
    apiRequest<void>(`/posts/${slug}/comments/${commentUuid}`, { method: "DELETE", token }),

  // ── Muallif (autentifikatsiya talab qiladi) ──────────────────────────────
  myList: (token: string, params: { page?: number; page_size?: number } = {}) =>
    apiRequest<Page<PostListItem>>(`/posts/me?${buildQuery(params)}`, { token }),

  myGet: (token: string, uuid: string) => apiRequest<PostResponse>(`/posts/me/${uuid}`, { token }),

  create: (
    token: string,
    data: {
      title: string
      content: string
      excerpt?: string
      cover?: string
      visibility?: "public" | "private"
      categories?: string[]
    },
  ) => apiRequest<PostResponse>("/posts", { method: "POST", body: data, token }),

  publish: (token: string, uuid: string) => apiRequest<PostResponse>(`/posts/me/${uuid}/publish`, { method: "POST", token }),

  unpublish: (token: string, uuid: string) => apiRequest<PostResponse>(`/posts/me/${uuid}/unpublish`, { method: "POST", token }),

  archive: (token: string, uuid: string) => apiRequest<PostResponse>(`/posts/me/${uuid}/archive`, { method: "POST", token }),

  unarchive: (token: string, uuid: string) => apiRequest<PostResponse>(`/posts/me/${uuid}/unarchive`, { method: "POST", token }),
}

// ── Server component uchun demo fallback'li o'ramlar ────────────────────────

export async function listPostsSafe(params: ListPostsParams = {}): Promise<Page<PostListItem>> {
  try {
    return await postsApi.list(params)
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("listPostsSafe error:", error)
    return { items: [], total: 0, page: params.page ?? 1, page_size: params.page_size ?? 20, pages: 0 }
  }
}

export async function getPostSafe(slug: string): Promise<PostResponse | null> {
  try {
    return await postsApi.get(slug)
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("getPostSafe error:", error)
    return null
  }
}

export async function getCommentsSafe(slug: string): Promise<Page<CommentResponse>> {
  try {
    return await postsApi.getComments(slug)
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("getCommentsSafe error:", error)
    return { items: [], total: 0, page: 1, page_size: 20, pages: 0 }
  }
}
