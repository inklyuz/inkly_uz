import { apiRequest } from "./client"
import type {
  CommentResponse,
  Page,
  PostListItem,
  PostReactionResponse,
  PostResponse,
  PostStatsResponse,
  PostVisibility,
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

export type CreatePostData = {
  title: string
  content?: string
  excerpt?: string
  cover?: string          // relative path: "posts/abc.webp"
  slug?: string
  visibility?: PostVisibility
  categories?: string[]   // UUID massivi, max 5 ta
  seo_indexable?: boolean
  allow_comments?: boolean
  allow_reactions?: boolean
  allow_reposts?: boolean
  is_pinned?: boolean
  scheduled_at?: string | null
}

export type UpdatePostData = Partial<{
  title: string
  content: string
  excerpt: string | null
  cover: string | null    // null → o'chirish
  slug: string
  visibility: PostVisibility
  categories: string[]
  scheduled_at: string | null
  seo_indexable: boolean
  is_pinned: boolean
  allow_comments: boolean
  allow_reactions: boolean
  allow_reposts: boolean
}>

export type PublishSettings = Partial<{
  visibility: PostVisibility
  scheduled_at: string | null
  seo_indexable: boolean
  is_pinned: boolean
  allow_comments: boolean
  allow_reactions: boolean
  allow_reposts: boolean
  excerpt: string
  cover: string
  categories: string[]
}>

export const postsApi = {
  // ── Ommaviy endpointlar ───────────────────────────────────────────────────
  list: (params: ListPostsParams = {}) =>
    apiRequest<Page<PostListItem>>(`/posts?${buildQuery(params)}`),

  // Token ixtiyoriy — faqat "reacted" field uchun kerak
  get: (slug: string, token?: string) =>
    apiRequest<PostResponse>(`/posts/${slug}`, { token }),

  getStats: (slug: string, token?: string) =>
    apiRequest<PostStatsResponse>(`/posts/${slug}/stats`, { token }),

  // ── Reaksiyalar (toggle) ──────────────────────────────────────────────────
  like: (slug: string, token: string) =>
    apiRequest<PostReactionResponse>(`/posts/${slug}/like`, { method: "POST", token }),

  dislike: (slug: string, token: string) =>
    apiRequest<PostReactionResponse>(`/posts/${slug}/dislike`, { method: "POST", token }),

  removeReaction: (slug: string, token: string) =>
    apiRequest<PostReactionResponse>(`/posts/${slug}/reaction`, { method: "DELETE", token }),

  // ── Izohlar ───────────────────────────────────────────────────────────────
  getComments: (slug: string, params: { page?: number; page_size?: number } = {}) => {
    const q = new URLSearchParams()
    if (params.page) q.set("page", String(params.page))
    if (params.page_size) q.set("page_size", String(params.page_size))
    return apiRequest<Page<CommentResponse>>(`/posts/${slug}/comments?${q}`)
  },

  addComment: (slug: string, content: string, token: string) =>
    apiRequest<CommentResponse>(`/posts/${slug}/comments`, { method: "POST", body: { content }, token }),

  deleteComment: (slug: string, commentUuid: string, token: string) =>
    apiRequest<void>(`/posts/${slug}/comments/${commentUuid}`, { method: "DELETE", token }),

  // ── Muallif (autentifikatsiya kerak) ──────────────────────────────────────
  myList: (token: string, params: ListPostsParams = {}) =>
    apiRequest<Page<PostListItem>>(`/posts/me?${buildQuery(params)}`, { token }),

  myGet: (token: string, uuid: string) =>
    apiRequest<PostResponse>(`/posts/me/${uuid}`, { token }),

  // Draft yaratish
  create: (token: string, data: CreatePostData) =>
    apiRequest<PostResponse>("/posts", { method: "POST", body: data, token }),

  // Draft yangilash (autosave)
  update: (token: string, uuid: string, data: UpdatePostData) =>
    apiRequest<PostResponse>(`/posts/me/${uuid}`, { method: "PATCH", body: data, token }),

  delete: (token: string, uuid: string) =>
    apiRequest<void>(`/posts/me/${uuid}`, { method: "DELETE", token }),

  // Nashr qilish — ixtiyoriy sozlamalar bilan
  publish: (token: string, uuid: string, settings?: PublishSettings) =>
    apiRequest<PostResponse>(`/posts/me/${uuid}/publish`, {
      method: "POST",
      body: settings ?? {},
      token,
    }),

  unpublish: (token: string, uuid: string) =>
    apiRequest<PostResponse>(`/posts/me/${uuid}/unpublish`, { method: "POST", token }),

  archive: (token: string, uuid: string) =>
    apiRequest<PostResponse>(`/posts/me/${uuid}/archive`, { method: "POST", token }),

  unarchive: (token: string, uuid: string) =>
    apiRequest<PostResponse>(`/posts/me/${uuid}/unarchive`, { method: "POST", token }),
}

// ── Server component uchun safe o'ramlar ──────────────────────────────────

export async function listPostsSafe(params: ListPostsParams = {}): Promise<Page<PostListItem>> {
  try {
    return await postsApi.list(params)
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("listPostsSafe error:", error)
    return { items: [], total: 0, page: params.page ?? 1, page_size: params.page_size ?? 20, pages: 0 }
  }
}

export async function getPostSafe(slug: string, token?: string): Promise<PostResponse | null> {
  try {
    return await postsApi.get(slug, token)
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
