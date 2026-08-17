// ─── Umumiy ───────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  message: string
  data: T
}

export interface ApiError {
  success: false
  code: string
  message: string
  details?: Record<string, unknown>
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface Page<T> {
  items: T[]
  page: number
  page_size: number
  total: number
  pages: number        // backend "pages" deydi, "total_pages" emas
}

// ─── Enumlar ──────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin"
export type UserStatus = "active" | "blocked"
export type PostStatus = "draft" | "published" | "archived"
export type PostVisibility = "public" | "private"
export type PostReactionType = "like" | "dislike"
export type TelegramPublicationStatus = "pending" | "published" | "failed" | "cancelled"
export type UploadType = "avatar" | "cover" | "post_image" | "temp"

// ─── Auth ─────────────────────────────────────────────────────────────────

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: "bearer"
  expires_in: number
}

export interface SessionOut {
  id: string
  device_name: string | null
  ip_address: string | null
  auth_method: string | null
  created_at: string
  last_seen_at: string | null
  expires_at: string
  is_active: boolean
  is_current: boolean
}

// ─── User ─────────────────────────────────────────────────────────────────

export interface SocialLinks {
  telegram: string | null
  instagram: string | null
  youtube: string | null
  github: string | null
  twitter: string | null
}

export interface UserBase {
  full_name: string
  username: string
  slug: string
  bio: string | null
  avatar: string | null
  cover: string | null
  website: string | null
  location: string | null
  socials: SocialLinks
  is_verified: boolean
}

export interface UserPublicResponse extends UserBase {
  posts_count?: number
  created_at?: string
}

export interface LinkedProvider {
  provider: "google" | "telegram"
  provider_email: string | null
  connected_at: string
}

export interface UserMeResponse extends UserBase {
  id: number
  uuid: string
  email: string | null
  role: UserRole
  status: UserStatus
  posts_count: number
  created_at: string
  updated_at: string
  linked_providers: LinkedProvider[]
}

// ─── Post ─────────────────────────────────────────────────────────────────

export interface PostAuthor {
  username: string
  slug: string
  full_name: string
  avatar: string | null
  is_verified: boolean
}

export interface PostCategory {
  uuid: string
  name: string
  slug: string
  icon: string | null
}

export interface SharingImage {
  id: string
  format: string
  size: number
  type: string
  url: string
}

export interface PostResponse {
  uuid: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  cover: string | null
  status: PostStatus
  visibility: PostVisibility
  published_at: string | null
  created_at: string
  updated_at: string
  author: PostAuthor
  likes_count: number
  dislikes_count: number
  comments_count: number
  views_count: number
  reacted: PostReactionType | null
  categories: PostCategory[]
  sharing_image: SharingImage | null
  is_pinned: boolean
  allow_comments: boolean
  allow_reactions: boolean
  seo_indexable: boolean
  scheduled_at: string | null
}

export interface PostListItem {
  uuid: string
  slug: string
  title: string
  excerpt: string | null
  cover: string | null
  status: PostStatus
  visibility: PostVisibility
  published_at: string | null
  created_at: string
  updated_at: string
  author: PostAuthor
  likes_count: number
  dislikes_count: number
  comments_count: number
  views_count: number
  categories: PostCategory[]
  is_pinned: boolean
  allow_comments: boolean
  allow_reactions: boolean
  scheduled_at: string | null
}

export interface PostReactionResponse {
  reacted: PostReactionType | null
  likes_count: number
  dislikes_count: number
}

export interface CommentResponse {
  uuid: string
  content: string
  created_at: string
  updated_at: string
  author: PostAuthor
}

export interface PostStatsResponse {
  uuid: string
  slug: string
  title: string
  status: PostStatus
  visibility: PostVisibility
  published_at: string | null
  created_at: string
  updated_at: string
  likes_count: number
  dislikes_count: number
  comments_count: number
  views_count: number
}

// ─── Category ─────────────────────────────────────────────────────────────

export interface CategoryPublicResponse {
  uuid: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  posts_count: number   // backend "posts_count" deydi
}

// ─── Upload ───────────────────────────────────────────────────────────────

export interface UploadResponse {
  path: string          // relative: "avatars/abc.webp" — PATCH /users/me ga shu yuboriladi
  url: string           // to'liq CDN URL (ko'rsatish uchun)
  width?: number
  height?: number
  size?: number
  format?: string
}