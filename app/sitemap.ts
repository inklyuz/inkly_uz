import type { MetadataRoute } from "next"
import { publicPostsApi } from "@/lib/api/public"
import { localPostHref } from "@/lib/utils/post-url"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inkly.uz"

const STATIC_ROUTES: Array<{ path: string; priority: number }> = [
  { path: "/",           priority: 1.0 },
  { path: "/posts",      priority: 0.9 },
  { path: "/creators",   priority: 0.8 },
  { path: "/categories", priority: 0.7 },
  { path: "/about",      priority: 0.5 },
  { path: "/contact",    priority: 0.4 },
  { path: "/privacy",    priority: 0.3 },
  { path: "/terms",      priority: 0.3 },
]

// Bitta sahifada joylashadigan maksimal post soni (sitemap juda katta
// bo'lib ketmasligi uchun) — kelajakda ko'p bo'lsa sitemap index'ga o'tkazish kerak.
const MAX_POSTS = 500

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date(),
    priority: route.priority,
  }))

  // Nashr qilingan maqolalarni dinamik qo'shamiz. Build vaqtida API'ga
  // ulanib bo'lmasa (masalan vaqtinchalik uzilish), butun build'ni
  // buzmaslik uchun xatoni yutib, faqat statik sahifalar bilan davom etamiz.
  try {
    const page = await publicPostsApi.list({ page: 1, page_size: MAX_POSTS })
    const postEntries: MetadataRoute.Sitemap = page.items.map((post) => ({
      url: `${siteUrl}${localPostHref(post)}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
      priority: 0.6,
    }))
    return [...staticEntries, ...postEntries]
  } catch {
    return staticEntries
  }
}