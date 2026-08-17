"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import {
  PenLine, Eye, Heart, MessageCircle, Loader2, Lock, Trash2,
  Archive, MoreHorizontal, FileText, ExternalLink,
  RotateCcw, Sparkles, TrendingUp, Users, BookMarked,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { formatDate, formatCount } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import type { PostListItem } from "@/types/api"

type TabKey = "published" | "drafts" | "archived"

export default function DashboardPage() {
  const { state } = useAuth()
  const { user, token, loading } = state
  const router = useRouter()

  const [posts, setPosts]         = useState<PostListItem[]>([])
  const [fetching, setFetching]   = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>("published")
  const [openMenu, setOpenMenu]   = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [user, loading, router])

  useEffect(() => {
    if (!token) return
    setFetching(true)
    postsApi.myList(token, { page_size: 50 })
      .then((d) => setPosts(d.items))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [token])

  useEffect(() => {
    if (!openMenu) return
    const h = () => setOpenMenu(null)
    window.addEventListener("click", h)
    return () => window.removeEventListener("click", h)
  }, [openMenu])

  const filtered = posts.filter((p) =>
    activeTab === "published" ? p.status === "published"
    : activeTab === "drafts"  ? p.status === "draft"
    : p.status === "archived",
  )

  const handleArchive = async (uuid: string) => {
    if (!token) return
    try {
      await postsApi.archive(token, uuid)
      setPosts((prev) => prev.map((p) => p.uuid === uuid ? { ...p, status: "archived" } : p))
      toast.success("Maqola arxivlandi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Arxivlashda xatolik")
    }
    setOpenMenu(null)
  }
  const handleUnarchive = async (uuid: string) => {
    if (!token) return
    try {
      // Backend javobidan haqiqiy statusni olamiz
      const updated = await postsApi.unarchive(token, uuid)
      setPosts((prev) => prev.map((p) => p.uuid === uuid ? { ...p, status: updated.status } : p))
      toast.success("Maqola arxivdan chiqarildi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Arxivdan chiqarishda xatolik")
    }
    setOpenMenu(null)
  }
  const handleDelete = async (uuid: string) => {
    if (!token || !confirm("Maqolani o'chirishni tasdiqlaysizmi?")) return
    try {
      await postsApi.delete(token, uuid)
      setPosts((prev) => prev.filter((p) => p.uuid !== uuid))
      toast.success("Maqola o'chirildi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "O'chirishda xatolik")
    }
    setOpenMenu(null)
  }

  const counts = {
    published: posts.filter((p) => p.status === "published").length,
    drafts:    posts.filter((p) => p.status === "draft").length,
    archived:  posts.filter((p) => p.status === "archived").length,
  }
  const pub = posts.filter((p) => p.status === "published")
  const totalViews    = pub.reduce((s, p) => s + p.views_count, 0)
  const totalLikes    = pub.reduce((s, p) => s + p.likes_count, 0)
  const totalComments = pub.reduce((s, p) => s + p.comments_count, 0)

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#FF6A00]" />
      </div>
    )
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "published", label: "Nashr qilingan" },
    { key: "drafts",    label: "Qoralamalar"    },
    { key: "archived",  label: "Arxiv"           },
  ]

  return (
    <div className="p-6 lg:p-8">

      {/* ── Sarlavha ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#141414]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Xush kelibsiz, <span className="font-medium text-[#141414]">{user.full_name}</span>
        </p>
      </div>

      {/* ── Stat kartalar ────────────────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<BookMarked size={18} />} label="Maqolalar"    value={counts.published} accent />
        <StatCard icon={<Eye size={18} />}        label="Ko'rishlar"   value={formatCount(totalViews)} />
        <StatCard icon={<Heart size={18} />}      label="Yoqtirishlar" value={formatCount(totalLikes)} />
        <StatCard icon={<MessageCircle size={18} />} label="Izohlar"   value={formatCount(totalComments)} />
      </div>

      {/* ── Qoralama banner ──────────────────────────────────────────── */}
      {!fetching && counts.drafts > 0 && activeTab === "published" && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#E8E3DD] bg-white px-4 py-3">
          <Sparkles size={14} className="shrink-0 text-[#FF6A00]" />
          <p className="text-sm text-[#36565F]">
            <span className="font-semibold text-[#141414]">{counts.drafts} ta qoralama</span> nashr kutmoqda.
          </p>
          <button
            onClick={() => setActiveTab("drafts")}
            className="ml-auto shrink-0 text-sm font-medium text-[#FF6A00] hover:underline underline-offset-4"
          >
            Ko'rish →
          </button>
        </div>
      )}

      {/* ── Maqolalar jadvali ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E8E3DD] bg-white">

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-[#E8E3DD] p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-[#FFF3E8] text-[#FF6A00]"
                  : "text-[#6B7280] hover:bg-[#F2F4F7] hover:text-[#141414]",
              )}
            >
              {tab.label}
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                activeTab === tab.key
                  ? "bg-[#FF6A00]/15 text-[#FF6A00]"
                  : "bg-[#F2F4F7] text-[#6B7280]",
              )}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#FF6A00]" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="divide-y divide-[#E8E3DD]">
            {filtered.map((post) => (
              <PostRow
                key={post.uuid}
                post={post}
                username={user.username}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
                onDelete={handleDelete}
                tab={activeTab}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent = false }: {
  icon: React.ReactNode; label: string; value: string | number; accent?: boolean
}) {
  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-xl border p-5",
      accent ? "border-[#FF6A00]/20 bg-[#FFF3E8]" : "border-[#E8E3DD] bg-white",
    )}>
      <span className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg",
        accent ? "bg-[#FF6A00]/15 text-[#FF6A00]" : "bg-[#F2F4F7] text-[#6B7280]",
      )}>
        {icon}
      </span>
      <div>
        <p className="text-2xl font-bold tracking-tight text-[#141414]">{value}</p>
        <p className="text-xs text-[#6B7280]">{label}</p>
      </div>
    </div>
  )
}

// ── PostRow ───────────────────────────────────────────────────────────────
function PostRow({ post, username, openMenu, setOpenMenu, onArchive, onUnarchive, onDelete, tab }: {
  post: PostListItem; username: string; openMenu: string | null
  setOpenMenu: (id: string | null) => void
  onArchive: (uuid: string) => void; onUnarchive: (uuid: string) => void
  onDelete: (uuid: string) => void; tab: TabKey
}) {
  const postUrl = `/@${post.author.username}/${post.slug}`

  return (
    <div className="group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[#FFF9F3] sm:items-center">
      {/* Cover */}
      {post.cover ? (
        <Link href={postUrl} className="hidden shrink-0 sm:block">
          <div className="h-14 w-20 overflow-hidden rounded-lg bg-[#F2F4F7]">
            <Image src={post.cover} alt="" width={80} height={56}
              className="h-full w-full object-cover" sizes="80px" />
          </div>
        </Link>
      ) : (
        <div className="hidden h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-[#F2F4F7] sm:flex">
          <FileText size={18} className="text-[#E8E3DD]" />
        </div>
      )}

      {/* Meta */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={postUrl}
          className="line-clamp-1 font-semibold leading-snug text-[#141414] transition-colors hover:text-[#FF6A00]"
        >
          {post.title || "Sarlavsiz"}
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280]">
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          {post.status === "draft" && post.updated_at && <span>Yangilangan: {formatDate(post.updated_at)}</span>}
          {post.status === "published" && (
            <>
              <span className="flex items-center gap-1"><Eye size={11} /> {formatCount(post.views_count)}</span>
              <span className="flex items-center gap-1"><Heart size={11} /> {formatCount(post.likes_count)}</span>
              <span className="flex items-center gap-1"><MessageCircle size={11} /> {formatCount(post.comments_count)}</span>
            </>
          )}
          {post.visibility === "private" && (
            <span className="flex items-center gap-1 text-[#FF6A00]"><Lock size={11} /> Maxfiy</span>
          )}
          {post.categories.slice(0, 2).map((cat) => (
            <Badge key={cat.uuid} variant="ghost" className="text-[10px]">{cat.name}</Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="relative flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Link href={`/write?edit=${post.uuid}`} title="Tahrirlash"
          className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F2F4F7] hover:text-[#141414] transition-colors">
          <PenLine size={14} />
        </Link>
        {tab === "published" && (
          <Link href={postUrl} target="_blank" title="Ko'rish"
            className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F2F4F7] hover:text-[#141414] transition-colors">
            <ExternalLink size={14} />
          </Link>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === post.uuid ? null : post.uuid) }}
          className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F2F4F7] hover:text-[#141414] transition-colors"
        >
          <MoreHorizontal size={14} />
        </button>

        {openMenu === post.uuid && (
          <div className="absolute right-0 top-full z-30 mt-1 w-48 rounded-xl border border-[#E8E3DD] bg-white p-1 shadow-lg"
            onClick={(e) => e.stopPropagation()}>
            <Link href={`/write?edit=${post.uuid}`}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#36565F] hover:bg-[#F2F4F7]">
              <PenLine size={13} /> Tahrirlash
            </Link>
            {tab === "published" && (
              <Link href={postUrl} target="_blank"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#36565F] hover:bg-[#F2F4F7]">
                <ExternalLink size={13} /> Ko&apos;rish
              </Link>
            )}
            {tab !== "archived" ? (
              <button onClick={() => onArchive(post.uuid)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#36565F] hover:bg-[#F2F4F7]">
                <Archive size={13} /> Arxivlash
              </button>
            ) : (
              <button onClick={() => onUnarchive(post.uuid)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#36565F] hover:bg-[#F2F4F7]">
                <RotateCcw size={13} /> Arxivdan chiqarish
              </button>
            )}
            <div className="my-1 h-px bg-[#E8E3DD]" />
            <button onClick={() => onDelete(post.uuid)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50">
              <Trash2 size={13} /> O&apos;chirish
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: TabKey }) {
  const msgs: Record<TabKey, { text: string; cta?: string }> = {
    published: { text: "Hali nashr qilingan maqola yo'q", cta: "Birinchi maqolangizni yozing" },
    drafts:    { text: "Qoralama yo'q",                   cta: "Yangi maqola boshlash"        },
    archived:  { text: "Arxivlangan maqola yo'q"                                               },
  }
  const { text, cta } = msgs[tab]
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F4F7]">
        <FileText size={20} className="text-[#6B7280]" />
      </div>
      <p className="text-sm text-[#36565F]">{text}</p>
      {cta && (
        <Link href="/write" className="text-sm font-medium text-[#FF6A00] underline underline-offset-4 hover:text-[#E85F00]">
          {cta} →
        </Link>
      )}
    </div>
  )
}