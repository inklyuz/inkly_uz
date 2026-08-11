// ─── Umumiy ───────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  message: string
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details: Record<string, unknown> | null
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface Page<T> {
  items: T[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

// ─── Enumlar ──────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin"
export type UserStatus = "active" | "blocked"
export type PostStatus = "draft" | "published" | "archived"
export type PostVisibility = "public" | "private"
export type PostReactionType = "like" | "dislike"
export type CreatorStatus = "pending" | "active" | "rejected" | "suspended"
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

export interface TelegramStartResponse {
  verification_id: string
  token: string
  expires_at: string
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

export type UserPublicResponse = UserBase

export interface UserMeResponse extends UserBase {
  id: number
  uuid: string
  email: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

// ─── Creator ──────────────────────────────────────────────────────────────

export interface CreatorPublicResponse {
  uuid: string
  username: string
  slug: string
  full_name: string
  avatar_url: string | null
  cover_url: string | null
  bio: string | null
  description: string | null
  is_verified: boolean
  created_at: string
}

export interface CreatorMeResponse extends CreatorPublicResponse {
  status: CreatorStatus
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
  post_count: number
}

// ─── Upload ───────────────────────────────────────────────────────────────

export interface UploadResponse {
  id: number
  uuid: string
  path: string
  url: string
  type: UploadType
  mime_type: string
  size: number
  created_at: string
}
