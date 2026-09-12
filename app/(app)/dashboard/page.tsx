"use client"

import { useEffect, useReducer, useCallback, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { PenLine, Eye, Heart, MessageCircle, Trash2, Archive, MoreHorizontal, FileText, ExternalLink, RotateCcw, Send, Users, BookOpen, TrendingUp, ArrowUpRight, Sparkles, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { formatDate, formatCount } from "@/lib/utils/format"
import { localPostHref } from "@/lib/utils/post-url"
import { cn } from "@/lib/utils"
import { getMediaUrl } from "@/lib/api/client"
import type { PostListItem } from "@/types/api"
import { LoadingDots } from "@/components/ui/loading-dots"
import { DashboardContainer } from "@/components/layout/containers"
import { Card } from "@/components/ui/card"
import { ConfirmModal } from "@/components/ui/confirm-modal"

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "published" | "scheduled" | "drafts" | "archived"

type State = {
  posts: PostListItem[]
  fetching: boolean
  error: string | null
  openMenu: string | null
  deleteTarget: string | null
  activeTab: TabKey
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_OK"; posts: PostListItem[] }
  | { type: "FETCH_ERR"; error: string }
  | { type: "SET_MENU"; uuid: string | null }
  | { type: "SET_DELETE_TARGET"; uuid: string | null }
  | { type: "SET_TAB"; tab: TabKey }
  | { type: "UPDATE_POST"; uuid: string; patch: Partial<PostListItem> }
  | { type: "REMOVE_POST"; uuid: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START": return { ...state, fetching: true, error: null }
    case "FETCH_OK": return { ...state, fetching: false, posts: action.posts }
    case "FETCH_ERR": return { ...state, fetching: false, error: action.error }
    case "SET_MENU": return { ...state, openMenu: action.uuid }
    case "SET_TAB": return { ...state, activeTab: action.tab, openMenu: null }
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

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, delta, deltaPositive = true, accent = false,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  delta?: string
  deltaPositive?: boolean
  accent?: boolean
}) {
  return (
    <Card variant="panel" interactive className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{
            background: accent ? "linear-gradient(135deg,rgba(255,106,0,0.12),rgba(255,138,61,0.07))" : "var(--color-bg-muted)",
            color: accent ? "var(--color-inkly-orange)" : "#9CA3AF",
            border: accent ? "1px solid rgba(255,106,0,0.15)" : "1px solid var(--color-inkly-orange-light)",
          }}
        >
          {icon}
        </span>
        {delta && (
          <span
            className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold"
            style={{
              background: deltaPositive ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              color: deltaPositive ? "var(--color-success)" : "var(--color-destructive)",
            }}
          >
            <TrendingUp size={9} />
            {delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-text-primary">{value}</p>
        <p className="mt-0.5 text-xs text-text-muted">{label}</p>
      </div>
    </Card>
  )
}

// ─── PostRow ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: "Nashr", color: "var(--color-success)", bg: "rgba(34,197,94,0.08)" },
  scheduled: { label: "Rejada", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
  publishing: { label: "Ketmoqda", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  failed: { label: "Xato", color: "var(--color-destructive)", bg: "rgba(239,68,68,0.08)" },
  draft: { label: "Qoralama", color: "#9CA3AF", bg: "var(--color-bg-muted)" },
  archived: { label: "Arxiv", color: "var(--color-text-muted)", bg: "var(--color-inkly-orange-light)" },
}

function PostRow({
  post, openMenu,
  onToggleMenu, onPublish, onUnpublish, onArchive, onUnarchive, onDelete,
}: {
  post: PostListItem
  openMenu: string | null
  onToggleMenu(uuid: string): void
  onPublish(uuid: string): void
  onUnpublish(uuid: string): void
  onArchive(uuid: string): void
  onUnarchive(uuid: string): void
  onDelete(uuid: string): void
}) {
  const postUrl = localPostHref(post)
  const isOpen = openMenu === post.uuid
  const badge = STATUS_BADGE[post.status] ?? STATUS_BADGE.draft

  const btnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isOpen || !btnRef.current) return
    const MENU_WIDTH = 192
    const MENU_HEIGHT_ESTIMATE = 260

    const update = () => {
      if (!btnRef.current) return
      const r = btnRef.current.getBoundingClientRect()
      let left = r.right - MENU_WIDTH
      let top = r.bottom + 4

      if (left < 8) left = 8
      if (left + MENU_WIDTH > window.innerWidth - 8) left = window.innerWidth - MENU_WIDTH - 8
      if (top + MENU_HEIGHT_ESTIMATE > window.innerHeight) {
        top = Math.max(8, r.top - MENU_HEIGHT_ESTIMATE - 4)
      }

      setMenuPos({ top, left })
    }

    update()
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [isOpen])

  const menuContent = isOpen && menuPos && (
    <div
      data-menu
      className="fixed z-[100] w-48 overflow-hidden rounded-xl bg-white"
      style={{
        top: menuPos.top,
        left: menuPos.left,
        border: "1px solid var(--color-border-default)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-1">
        <Link
          href={`/write?edit=${post.uuid}`}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-muted"
        >
          <PenLine size={13} className="text-text-muted" /> Tahrirlash
        </Link>
        <Link
          href={postUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-muted"
        >
          <ExternalLink size={13} className="text-text-muted" /> Ko'rish
        </Link>
        {post.status === "draft" && (
          <button
            onClick={() => onPublish(post.uuid)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-muted"
          >
            <Send size={13} className="text-text-muted" /> Nashr qilish
          </button>
        )}
        {post.status === "published" && (
          <button
            onClick={() => onUnpublish(post.uuid)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-muted"
          >
            <RotateCcw size={13} className="text-text-muted" /> Qoralamaga olish
          </button>
        )}
        {post.status === "archived" ? (
          <button
            onClick={() => onUnarchive(post.uuid)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-muted"
          >
            <RotateCcw size={13} className="text-text-muted" /> Arxivdan chiqarish
          </button>
        ) : (
          <button
            onClick={() => onArchive(post.uuid)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-muted"
          >
            <Archive size={13} className="text-text-muted" /> Arxivlash
          </button>
        )}
      </div>
      <div className="p-1" style={{ borderTop: "1px solid var(--color-bg-muted)" }}>
        <button
          onClick={() => onDelete(post.uuid)}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
        >
          <Trash2 size={13} /> O'chirish
        </button>
      </div>
    </div>
  )

  return (
    <div className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white sm:gap-4">

      {/* Cover */}
      <div className="hidden shrink-0 sm:block">
        <div className="h-11 w-16 overflow-hidden rounded-xl bg-bg-muted">
          {post.cover ? (
            <Image src={getMediaUrl(post.cover) || "/placeholder.svg"} alt="" width={64} height={44}
              className="h-full w-full object-cover" sizes="64px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FileText size={13} className="text-border-default" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={postUrl}
            className="line-clamp-1 text-sm font-medium text-text-primary transition-colors hover:text-primary"
          >
            {post.title || "Sarlavsiz"}
          </Link>
          <span
            className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {post.published_at ? formatDate(post.published_at) : "—"}
            {post.reading_time && <> · {post.reading_time} daqiqa</>}
          </span>
          <span className="flex items-center gap-1"><Eye size={10} /> {formatCount(post.views_count)}</span>
          <span className="hidden items-center gap-1 sm:flex"><Heart size={10} /> {formatCount(post.likes_count)}</span>
          <span className="hidden items-center gap-1 sm:flex"><MessageCircle size={10} /> {formatCount(post.comments_count)}</span>
        </p>
      </div>

      {/* Context menu tugmasi */}
      <div className="relative shrink-0" data-menu>
        <button
          ref={btnRef}
          onClick={(e) => { e.stopPropagation(); onToggleMenu(post.uuid) }}
          className="rounded-xl p-2 text-text-muted transition-all hover:bg-bg-muted hover:text-text-secondary"
        >
          <MoreHorizontal size={14} />
        </button>

        {mounted && menuContent && createPortal(menuContent, document.body)}
      </div>
    </div>
  )
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({
  active, counts, onChange,
}: {
  active: TabKey
  counts: Record<TabKey, number>
  onChange(tab: TabKey): void
}) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "published", label: "Nashr qilingan" },
    { key: "scheduled", label: "Rejada" },
    { key: "drafts", label: "Qoralamalar" },
    { key: "archived", label: "Arxiv" },
  ]
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-2 pt-2">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
            active === key ? "text-primary" : "text-text-muted hover:text-text-muted",
          )}
          style={{
            background: active === key
              ? "linear-gradient(135deg,rgba(255,106,0,0.09),rgba(255,138,61,0.05))"
              : "transparent",
            border: active === key ? "1px solid rgba(255,106,0,0.15)" : "1px solid transparent",
          }}
        >
          {label}
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
            style={{
              background: active === key ? "rgba(255,106,0,0.12)" : "var(--color-inkly-orange-light)",
              color: active === key ? "var(--color-inkly-orange)" : "#9CA3AF",
            }}
          >
            {counts[key]}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { state: auth } = useAuth()
  const { user, token, loading } = auth

  const [state, dispatch] = useReducer(reducer, {
    posts: [], fetching: true, error: null,
    openMenu: null, deleteTarget: null, activeTab: "published",
  })
  const { posts, fetching, error, openMenu, deleteTarget, activeTab } = state

  const fetchPosts = useCallback(async () => {
    if (!token) return
    dispatch({ type: "FETCH_START" })
    try {
      const pageSize = 50
      const first = await postsApi.myList(token, { page: 1, page_size: pageSize })
      let items = first?.items ?? []
      const totalPages = first?.total_pages ?? 1
      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            postsApi.myList(token, { page: i + 2, page_size: pageSize }),
          ),
        )
        items = items.concat(...rest.map((p) => p?.items ?? []))
      }
      dispatch({ type: "FETCH_OK", posts: items })
    } catch (err) {
      dispatch({ type: "FETCH_ERR", error: err instanceof Error ? err.message : "Xatolik" })
    }
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
  const scheduled = posts.filter((p) => p.status === "scheduled")
  const drafts = posts.filter((p) => p.status === "draft")
  const archived = posts.filter((p) => p.status === "archived")

  const tabMap: Record<TabKey, PostListItem[]> = {
    published: pub,
    scheduled,
    drafts,
    archived,
  }
  const tabCounts: Record<TabKey, number> = {
    published: pub.length,
    scheduled: scheduled.length,
    drafts: drafts.length,
    archived: archived.length,
  }

  const totalViews = pub.reduce((s, p) => s + p.views_count, 0)
  const totalLikes = pub.reduce((s, p) => s + p.likes_count, 0)
  const totalComments = pub.reduce((s, p) => s + p.comments_count, 0)

  const topPost = [...pub].sort((a, b) => b.views_count - a.views_count)[0]
  const visiblePosts = tabMap[activeTab]
    .sort((a, b) =>
      new Date(b.published_at ?? b.updated_at ?? 0).getTime() -
      new Date(a.published_at ?? a.updated_at ?? 0).getTime()
    )
    .slice(0, 10)

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingDots size="lg" className="text-primary" />
      </div>
    )
  }

  const firstName = user.full_name.split(" ")[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech"

  return (
    <>
      {deleteTarget && (
        <ConfirmModal
          title="Maqolani o'chirish"
          description="Bu amalni ortga qaytarib bo'lmaydi."
          confirmLabel="O'chirish"
          onConfirm={handleDelete}
          onCancel={() => dispatch({ type: "SET_DELETE_TARGET", uuid: null })}
        />
      )}

      <div className="min-h-full py-4 sm:py-6 lg:py-8" style={{ background: "var(--color-bg-muted)" }}>
        <DashboardContainer className="space-y-6">

          {/* ── Header ───────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <Image
                  src={getMediaUrl(user.avatar) || "/placeholder.svg"} alt={user.full_name}
                  width={48} height={48}
                  className="h-12 w-12 rounded-2xl object-cover"
                  style={{ border: "2px solid var(--color-border-default)" }}
                />
              ) : (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-bold text-white"
                  style={{ background: "linear-gradient(135deg,var(--color-inkly-orange),var(--color-inkly-coral))" }}
                >
                  {firstName[0]}
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-text-muted">{greeting} 👋</p>
                <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-text-primary sm:text-[28px]">
                  {firstName}!
                </h1>
              </div>
            </div>

            <Link
              href="/write"
              className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,var(--color-inkly-orange),var(--color-inkly-coral))",
                boxShadow: "0 1px 0 rgba(255,255,255,0.15) inset, 0 3px 10px rgba(255,106,0,0.30)",
              }}
            >
              <PenLine size={13} />
              <span className="hidden sm:inline">Yangi maqola</span>
            </Link>
          </div>

          {/* ── Stat cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard icon={<BookOpen size={15} />} label="Nashr qilingan" value={pub.length} />
            <StatCard icon={<Eye size={15} />} label="Ko'rishlar" value={formatCount(totalViews)} accent />
            <StatCard icon={<Heart size={15} />} label="Yoqtirishlar" value={formatCount(totalLikes)} accent />
            <StatCard icon={<MessageCircle size={15} />} label="Izohlar" value={formatCount(totalComments)} />
            <StatCard icon={<Users size={15} />} label="Obunachilar" value={formatCount(user.followers_count ?? 0)} />
          </div>

          {/* ── Two-column grid ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_296px]">

            {/* ── LEFT: Posts with tabs ──────────────────────────────────── */}
            <Card variant="panel" className="overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
                <h2 className="text-base font-semibold text-text-primary">Maqolalar</h2>
                <Link
                  href={`/dashboard/posts${activeTab !== "published" ? `?tab=${activeTab}` : ""}`}
                  className="flex items-center gap-1 text-xs font-medium text-text-muted transition-colors hover:text-primary"
                >
                  Barchasini ko'rish <ArrowUpRight size={12} />
                </Link>
              </div>

              {/* Tabs */}
              <TabBar active={activeTab} counts={tabCounts} onChange={(t) => dispatch({ type: "SET_TAB", tab: t })} />

              {/* List */}
              {fetching ? (
                <div className="flex justify-center py-14">
                  <LoadingDots size="lg" className="text-primary" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-2 py-14 text-center">
                  <p className="text-sm text-red-500">{error}</p>
                  <button onClick={fetchPosts} className="text-sm font-semibold text-primary underline underline-offset-4">
                    Qayta urinish
                  </button>
                </div>
              ) : visiblePosts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-14">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-default bg-bg-muted">
                    <FileText size={18} className="text-border-default" />
                  </div>
                  <p className="text-sm text-text-muted">
                    {activeTab === "published" && "Hali nashr qilingan maqola yo'q"}
                    {activeTab === "drafts" && "Qoralamalar yo'q"}
                    {activeTab === "archived" && "Arxivlangan maqolalar yo'q"}
                  </p>
                  {activeTab === "published" && (
                    <Link href="/write"
                      className="text-sm font-semibold text-primary underline underline-offset-4">
                      Birinchi maqolangizni yozing →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-bg-muted">
                  {visiblePosts.map((post) => (
                    <PostRow
                      key={post.uuid}
                      post={post}
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
            </Card>

            {/* ── RIGHT sidebar ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Top post */}
              {topPost && (
                <Card variant="panel" className="p-4">
                  <div className="mb-3 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-primary" />
                    <h2 className="text-base font-semibold text-text-primary">Eng ko'p o'qilgan</h2>
                  </div>
                  <Link
                    href={localPostHref(topPost)}
                    className="group flex gap-3"
                  >
                    <div className="h-14 w-[72px] shrink-0 overflow-hidden rounded-xl bg-bg-muted">
                      {topPost.cover ? (
                        <Image src={getMediaUrl(topPost.cover) || "/placeholder.svg"} alt="" width={72} height={56}
                          className="h-full w-full object-cover" sizes="72px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileText size={14} className="text-border-default" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-text-primary transition-colors group-hover:text-primary">
                        {topPost.title}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-text-muted">
                        <span className="flex items-center gap-0.5">
                          <Eye size={10} /> {formatCount(topPost.views_count)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart size={10} /> {formatCount(topPost.likes_count)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </Card>
              )}

              {drafts.length > 0 && (
                <Link
                  href="/dashboard/posts?tab=drafts"
                  className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm transition-colors hover:bg-primary/10"
                >
                  <span className="font-medium text-text-primary">{drafts.length} ta qoralama nashr kutmoqda</span>
                  <ArrowUpRight size={15} className="text-primary" />
                </Link>
              )}

            </div>
          </div>
        </DashboardContainer>
      </div>
    </>
  )
}
