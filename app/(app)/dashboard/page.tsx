"use client"

import { useEffect, useReducer, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import {
  PenLine, Eye, Heart, MessageCircle, Loader2,
  Trash2, Archive, MoreHorizontal, FileText,
  ExternalLink, RotateCcw, Send, Users,
  BookOpen, TrendingUp, ArrowUpRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { formatDate, formatCount } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import type { PostListItem } from "@/types/api"

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "published" | "drafts" | "archived"

type State = {
  posts: PostListItem[]
  fetching: boolean
  error: string | null
  openMenu: string | null
  deleteTarget: string | null
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_OK"; posts: PostListItem[] }
  | { type: "FETCH_ERR"; error: string }
  | { type: "SET_MENU"; uuid: string | null }
  | { type: "SET_DELETE_TARGET"; uuid: string | null }
  | { type: "UPDATE_POST"; uuid: string; patch: Partial<PostListItem> }
  | { type: "REMOVE_POST"; uuid: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START": return { ...state, fetching: true, error: null }
    case "FETCH_OK": return { ...state, fetching: false, posts: action.posts }
    case "FETCH_ERR": return { ...state, fetching: false, error: action.error }
    case "SET_MENU": return { ...state, openMenu: action.uuid }
    case "SET_DELETE_TARGET": return { ...state, deleteTarget: action.uuid, openMenu: null }
    case "UPDATE_POST": return {
      ...state, openMenu: null,
      posts: state.posts.map((p) => p.uuid === action.uuid ? { ...p, ...action.patch } : p),
    }
    case "REMOVE_POST": return {
      ...state, openMenu: null, deleteTarget: null,
      posts: state.posts.filter((p) => p.uuid !== action.uuid),
    }
  }
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null
  const w = 340, h = 90, pad = 8
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (w - pad * 2))
  const ys = data.map((v) => h - pad - ((v - min) / range) * (h - pad * 2))
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ")
  const area = `${line} L${xs[xs.length - 1]},${h} L${xs[0]},${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FF6A00" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={line} fill="none" stroke="#FF6A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── DeleteModal ──────────────────────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[#EEEBE6] bg-white p-6 shadow-xl">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <Trash2 size={16} className="text-red-500" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-[#141414]">Maqolani o'chirish</h3>
        <p className="mb-6 text-sm text-[#6B7280]">Bu amalni ortga qaytarib bo'lmaydi.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 rounded-lg border border-[#EEEBE6] py-2.5 text-sm font-medium text-[#4B5563] hover:bg-[#F5F5F4]">
            Bekor qilish
          </button>
          <button onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600">
            O'chirish
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { state: auth } = useAuth()
  const { user, token, loading } = auth
  const router = useRouter()

  const [state, dispatch] = useReducer(reducer, {
    posts: [], fetching: true, error: null, openMenu: null, deleteTarget: null,
  })
  const { posts, fetching, error, openMenu, deleteTarget } = state

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [user, loading, router])

  const fetchPosts = useCallback(() => {
    if (!token) return
    dispatch({ type: "FETCH_START" })
    postsApi.myList(token, { page_size: 50 })
      .then((d) => dispatch({ type: "FETCH_OK", posts: d?.items ?? [] }))
      .catch((err) => dispatch({ type: "FETCH_ERR", error: err instanceof Error ? err.message : "Xatolik" }))
  }, [token])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  useEffect(() => {
    if (!openMenu) return
    const h = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-menu]"))
        dispatch({ type: "SET_MENU", uuid: null })
    }
    window.addEventListener("click", h)
    return () => window.removeEventListener("click", h)
  }, [openMenu])

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function postAction(
    uuid: string,
    fn: () => Promise<Partial<PostListItem> | void>,
    ok: string, fail: string, remove = false,
  ) {
    if (!token) return
    try {
      const result = await fn()
      if (remove) dispatch({ type: "REMOVE_POST", uuid })
      else dispatch({ type: "UPDATE_POST", uuid, patch: (result ?? {}) as Partial<PostListItem> })
      toast.success(ok)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : fail)
    }
  }

  const handlePublish = (u: string) => postAction(u, () => postsApi.publish(token!, u), "Nashr qilindi", "Nashr qilishda xatolik")
  const handleUnpublish = (u: string) => postAction(u, () => postsApi.unpublish(token!, u), "Qoralamaga qaytarildi", "Xatolik")
  const handleArchive = (u: string) => postAction(u, () => postsApi.archive(token!, u), "Arxivlandi", "Arxivlashda xatolik")
  const handleUnarchive = (u: string) => postAction(u, () => postsApi.unarchive(token!, u), "Arxivdan chiqarildi", "Xatolik")
  const handleDelete = () => {
    if (!deleteTarget) return
    postAction(deleteTarget, () => postsApi.delete(token!, deleteTarget), "O'chirildi", "O'chirishda xatolik", true)
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const pub = posts.filter((p) => p.status === "published")
  const drafts = posts.filter((p) => p.status === "draft")
  const totalViews = pub.reduce((s, p) => s + p.views_count, 0)
  const totalLikes = pub.reduce((s, p) => s + p.likes_count, 0)
  const totalComments = pub.reduce((s, p) => s + p.comments_count, 0)

  // Mock chart data — real API'dan keladi keyinroq
  const chartData = [320, 480, 380, 620, 540, 780, 920, 840, 1100, 980, 1240, 1180,
    1350, 1200, 1420, 1380, 1500, 1320, 1480, 1600, 1520, 1680, 1740, 1820,
    1760, 1900, 1840, 2000, 1960, 2100, 2080]

  const topPost = pub.sort((a, b) => b.views_count - a.views_count)[0]
  const recentPosts = [...pub].sort((a, b) =>
    new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime()
  ).slice(0, 5)

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#FF6A00]" />
      </div>
    )
  }

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => dispatch({ type: "SET_DELETE_TARGET", uuid: null })}
        />
      )}

      <div className="min-h-full bg-[#F7F6F3] p-5 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* ── Header ───────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#141414]">
                Xush kelibsiz, {user.full_name.split(" ")[0]}!
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Bugun ijodingiz bilan dunyoni ilhomlantiring.
              </p>
            </div>
            <Link
              href="/write"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#141414] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1f1f1f]"
            >
              <PenLine size={14} />
              Yangi post yaratish
            </Link>
          </div>

          {/* ── Stat cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard icon={<BookOpen size={16} />} label="Jami postlar" value={pub.length} delta="3 ta bu oyda" />
            <StatCard icon={<Eye size={16} />} label="Jami ko'rishlar" value={formatCount(totalViews)} delta="18% bu oyda" highlight />
            <StatCard icon={<Heart size={16} />} label="Jami yklar" value={formatCount(totalLikes)} delta="21% bu oyda" highlight />
            <StatCard icon={<MessageCircle size={16} />} label="Izohlar" value={formatCount(totalComments)} delta="11% bu oyda" />
            <StatCard icon={<Users size={16} />} label="Obunachilar" value="—" delta="27 bu oyda" />
          </div>

          {/* ── Two-column ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">

            {/* ── Left: Recent posts ───────────────────────────────────────── */}
            <div className="rounded-2xl border border-[#EEEBE6] bg-white">
              <div className="flex items-center justify-between border-b border-[#EEEBE6] px-5 py-4">
                <h2 className="text-sm font-semibold text-[#141414]">So'nggi postlar</h2>
                <Link
                  href="/dashboard/posts"
                  className="flex items-center gap-1 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#FF6A00]"
                >
                  Barchasini ko'rish <ArrowUpRight size={13} />
                </Link>
              </div>

              {fetching ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={22} className="animate-spin text-[#FF6A00]" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <p className="text-sm text-red-500">{error}</p>
                  <button onClick={fetchPosts} className="text-sm font-semibold text-[#FF6A00] underline underline-offset-4">
                    Qayta urinish
                  </button>
                </div>
              ) : recentPosts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F4]">
                    <TrendingUp size={20} className="text-[#9CA3AF]" />
                  </div>
                  <p className="text-sm text-[#6B7280]">Hali nashr qilingan maqola yo'q</p>
                  <Link href="/write" className="text-sm font-semibold text-[#FF6A00] underline underline-offset-4">
                    Birinchi maqolangizni yozing →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#F5F5F4]">
                  {recentPosts.map((post) => (
                    <PostRow
                      key={post.uuid}
                      post={post}
                      username={user.username}
                      openMenu={openMenu}
                      onToggleMenu={(uuid) =>
                        dispatch({ type: "SET_MENU", uuid: openMenu === uuid ? null : uuid })
                      }
                      onPublish={handlePublish}
                      onUnpublish={handleUnpublish}
                      onArchive={handleArchive}
                      onUnarchive={handleUnarchive}
                      onDelete={(uuid) => dispatch({ type: "SET_DELETE_TARGET", uuid })}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Right sidebar ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Chart */}
              <div className="rounded-2xl border border-[#EEEBE6] bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#141414]">Faollik grafigi</h2>
                  <span className="rounded-lg border border-[#EEEBE6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
                    Bu oy
                  </span>
                </div>
                <div className="mb-3 flex items-end justify-between text-[10px] text-[#C4BEB8]">
                  <span>1.5K</span>
                  <span>1K</span>
                  <span>500</span>
                  <span>0</span>
                </div>
                <Sparkline data={chartData} />
                <div className="mt-2 flex justify-between text-[10px] text-[#C4BEB8]">
                  {[1, 8, 15, 22, 31].map((d) => <span key={d}>{d}</span>)}
                </div>
              </div>

              {/* Top post */}
              {topPost && (
                <div className="rounded-2xl border border-[#EEEBE6] bg-white p-5">
                  <h2 className="mb-3 text-sm font-semibold text-[#141414]">Eng ko'p o'qilgan post</h2>
                  <Link
                    href={`/@${topPost.author?.username ?? user.username}/${topPost.slug}`}
                    className="group flex gap-3"
                  >
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F5F5F4]">
                      {topPost.cover ? (
                        <Image src={topPost.cover} alt="" width={80} height={56}
                          className="h-full w-full object-cover" sizes="80px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileText size={16} className="text-[#D1D5DB]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-[#141414] group-hover:text-[#FF6A00] transition-colors">
                        {topPost.title}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-[#9CA3AF]">
                        <Eye size={11} /> {formatCount(topPost.views_count)} ko'rish
                      </p>
                    </div>
                  </Link>
                </div>
              )}

              {/* Quick links */}
              <div className="rounded-2xl border border-[#EEEBE6] bg-white p-5">
                <h2 className="mb-3 text-sm font-semibold text-[#141414]">Tezkor havolalar</h2>
                <div className="flex flex-col gap-0.5">
                  {[
                    { label: "Blogingizni ko'rish", href: `/@${user.username}` },
                    { label: "Profil sahifangiz", href: "/settings/profile" },
                    { label: "Statistikani batafsil ko'rish", href: "/dashboard/posts" },
                  ].map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      target={href.startsWith("/@") ? "_blank" : undefined}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[#4B5563] transition-colors hover:bg-[#F5F5F4] hover:text-[#141414]"
                    >
                      {label}
                      <ExternalLink size={12} className="text-[#C4BEB8]" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Drafts nudge */}
              {drafts.length > 0 && (
                <div className="rounded-2xl border border-[#FF6A00]/20 bg-[#FFF8F3] p-5">
                  <p className="text-sm text-[#4B5563]">
                    <span className="font-semibold text-[#141414]">{drafts.length} ta qoralama</span> nashr kutmoqda.
                  </p>
                  <Link
                    href="/dashboard/posts"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#FF6A00] hover:underline underline-offset-4"
                  >
                    Ko'rish <ArrowUpRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, delta, highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  delta?: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#EEEBE6] bg-white p-4">
      <div className="flex items-center gap-2">
        <span className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg",
          highlight ? "bg-[#FFF3E8] text-[#FF6A00]" : "bg-[#F5F5F4] text-[#9CA3AF]",
        )}>
          {icon}
        </span>
        <span className="text-xs text-[#9CA3AF]">{label}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-[#141414]">{value}</p>
      {delta && (
        <p className="flex items-center gap-1 text-xs text-[#22C55E]">
          <TrendingUp size={11} /> {delta}
        </p>
      )}
    </div>
  )
}

// ─── PostRow ──────────────────────────────────────────────────────────────────

function PostRow({
  post, username, openMenu,
  onToggleMenu, onPublish, onUnpublish, onArchive, onUnarchive, onDelete,
}: {
  post: PostListItem
  username: string
  openMenu: string | null
  onToggleMenu: (uuid: string) => void
  onPublish: (uuid: string) => void
  onUnpublish: (uuid: string) => void
  onArchive: (uuid: string) => void
  onUnarchive: (uuid: string) => void
  onDelete: (uuid: string) => void
}) {
  const postUrl = `/@${post.author?.username ?? username}/${post.slug}`
  const isOpen = openMenu === post.uuid

  return (
    <div className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#FAFAF9]">
      {/* Cover */}
      <div className="hidden shrink-0 sm:block">
        <div className="h-11 w-16 overflow-hidden rounded-lg bg-[#F5F5F4]">
          {post.cover ? (
            <Image src={post.cover} alt="" width={64} height={44}
              className="h-full w-full object-cover" sizes="64px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FileText size={14} className="text-[#D1D5DB]" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link href={postUrl}
          className="line-clamp-1 text-sm font-medium text-[#141414] hover:text-[#FF6A00] transition-colors">
          {post.title || "Sarlavsiz"}
        </Link>
        <p className="mt-0.5 text-xs text-[#9CA3AF]">
          {post.published_at ? formatDate(post.published_at) : "—"}
          {post.reading_time ? ` · ${post.reading_time} daqiqa o'qish` : ""}
        </p>
      </div>

      {/* Stats */}
      <div className="hidden items-center gap-3 text-xs text-[#9CA3AF] sm:flex">
        <span className="flex items-center gap-1">
          <Eye size={11} /> {formatCount(post.views_count)}
        </span>
        <span className="flex items-center gap-1">
          <Heart size={11} /> {formatCount(post.likes_count)}
        </span>
      </div>

      {/* Menu */}
      <div className="relative shrink-0" data-menu>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleMenu(post.uuid) }}
          className={cn(
            "rounded-lg p-2 text-[#9CA3AF] transition-colors hover:bg-[#F5F5F4] hover:text-[#4B5563]",
            !isOpen && "opacity-0 group-hover:opacity-100",
          )}
        >
          <MoreHorizontal size={14} />
        </button>

        {isOpen && (
          <div
            className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-[#EEEBE6] bg-white shadow-lg shadow-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1">
              <Link href={`/write?edit=${post.uuid}`}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#4B5563] hover:bg-[#F5F5F4]">
                <PenLine size={13} className="text-[#9CA3AF]" /> Tahrirlash
              </Link>
              <Link href={postUrl} target="_blank"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#4B5563] hover:bg-[#F5F5F4]">
                <ExternalLink size={13} className="text-[#9CA3AF]" /> Ko&apos;rish
              </Link>
              {post.status === "draft" && (
                <button onClick={() => onPublish(post.uuid)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#4B5563] hover:bg-[#F5F5F4]">
                  <Send size={13} className="text-[#9CA3AF]" /> Nashr qilish
                </button>
              )}
              {post.status === "published" && (
                <button onClick={() => onUnpublish(post.uuid)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#4B5563] hover:bg-[#F5F5F4]">
                  <RotateCcw size={13} className="text-[#9CA3AF]" /> Nashrdan olish
                </button>
              )}
              <button onClick={() => onArchive(post.uuid)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#4B5563] hover:bg-[#F5F5F4]">
                <Archive size={13} className="text-[#9CA3AF]" /> Arxivlash
              </button>
            </div>
            <div className="border-t border-[#F5F5F4] p-1">
              <button onClick={() => onDelete(post.uuid)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                <Trash2 size={13} /> O&apos;chirish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}