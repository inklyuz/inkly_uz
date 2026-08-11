import { apiRequest, withFallback } from "./client"
import { demoComments, demoPosts, filterDemoPosts, paginate } from "@/lib/demo/data"
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

  publish: (token: string, uuid: string) => apiRequest<PostResponse>(`/posts/${uuid}/publish`, { method: "POST", token }),
}

// ── Server component uchun demo fallback'li o'ramlar ────────────────────────

export function listPostsSafe(params: ListPostsParams = {}): Promise<Page<PostListItem>> {
  return withFallback(
    () => postsApi.list(params),
    paginate(filterDemoPosts(params), params.page ?? 1, params.page_size ?? 20),
  )
}

export function getPostSafe(slug: string): Promise<PostResponse | null> {
  return withFallback(() => postsApi.get(slug), demoPosts.find((p) => p.slug === slug) ?? null)
}

export function getCommentsSafe(slug: string): Promise<Page<CommentResponse>> {
  return withFallback(() => postsApi.getComments(slug), paginate(demoComments, 1, 20))
}
