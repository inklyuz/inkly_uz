"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BookOpen, Plus, Eye, Heart, MessageCircle, Trash2, PenLine, ExternalLink, Clock, ArchiveRestore, Send, XCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { formatCount, formatDate } from "@/lib/utils/format"
import { localPostHref } from "@/lib/utils/post-url"
import { cn } from "@/lib/utils"
import type { Page, PostListItem, PostStatus } from "@/types/api"
import { LoadingDots } from "@/components/ui/loading-dots"
import { DashboardContainer } from "@/components/layout/containers"
import { Card } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { ConfirmModal } from "@/components/ui/confirm-modal"

const PAGE_SIZE = 10

// Bir xil status belgilari — dashboarddagi bilan aynan bir xil ranglar/nomlar
const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: "Nashr", color: "var(--color-success)", bg: "rgba(34,197,94,0.08)" },
  scheduled: { label: "Rejada", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
  publishing: { label: "Ketmoqda", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  failed: { label: "Xato", color: "var(--color-destructive)", bg: "rgba(239,68,68,0.08)" },
  draft: { label: "Qoralama", color: "#9CA3AF", bg: "var(--color-bg-muted)" },
  archived: { label: "Arxiv", color: "var(--color-text-muted)", bg: "var(--color-inkly-orange-light)" },
}

type TabKey = "all" | "published" | "scheduled" | "failed" | "drafts" | "archived"

const TABS: { key: TabKey; label: string; status?: PostStatus }[] = [
  { key: "all",       label: "Barchasi" },
  { key: "published", label: "Nashr",      status: "published" },
  { key: "scheduled", label: "Rejada",     status: "scheduled" },
  { key: "failed",    label: "Xato",       status: "failed" },
  { key: "drafts",    label: "Qoralamalar", status: "draft" },
  { key: "archived",  label: "Arxiv",      status: "archived" },
]

function TabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto px-2 pt-2">
      {TABS.map(({ key, label }) => (
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
        </button>
      ))}
    </div>
  )
}

export default function DashboardPostsPage() {
  return (
    <Suspense fallback={null}>
      <DashboardPostsContent />
    </Suspense>
  )
}

function DashboardPostsContent() {
  const { state } = useAuth()
  const { token, user, loading: authLoading } = state
  const searchParams = useSearchParams()
  const router = useRouter()
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)

  // Tab holati — URL'dan o'qiladi
  const rawTab = searchParams.get("tab") ?? "all"
  const activeTab: TabKey = (["all", "published", "scheduled", "failed", "drafts", "archived"] as const).includes(rawTab as TabKey)
    ? (rawTab as TabKey)
    : "all"

  const [allData, setAllData] = useState<Page<PostListItem> | null>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PostListItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [unarchiving, setUnarchiving] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/dashboard/posts")
    }
  }, [authLoading, router, user])

  const fetchPosts = useCallback(() => {
    if (!token) return
    setFetching(true)
    setError(null)
    postsApi
      .myList(token, { page, page_size: PAGE_SIZE })
      .then(setAllData)
      .catch((err) => setError(err instanceof Error ? err.message : "Maqolalarni yuklab bo'lmadi"))
      .finally(() => setFetching(false))
  }, [page, token])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // Tab filteri — client-side (bitta so'rovda barcha holat)
  const tabStatus = TABS.find((t) => t.key === activeTab)?.status
  const filteredItems = tabStatus
    ? (allData?.items ?? []).filter((p) => p.status === tabStatus)
    : (allData?.items ?? [])

  const handleTabChange = (tab: TabKey) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === "all") {
      params.delete("tab")
    } else {
      params.set("tab", tab)
    }
    params.delete("page")
    router.push(`/dashboard/posts?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!token || !deleteTarget) return
    setDeleting(true)
    try {
      await postsApi.delete(token, deleteTarget.uuid)
      setAllData((prev) =>
        prev ? { ...prev, items: prev.items.filter((p) => p.uuid !== deleteTarget.uuid) } : prev,
      )
      toast.success("Maqola o'chirildi")
      setDeleteTarget(null)
      if (allData && allData.items.length === 1 && page > 1) {
        router.push(`/dashboard/posts?page=${page - 1}`)
      } else {
        fetchPosts()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "O'chirishda xatolik")
    } finally {
      setDeleting(false)
    }
  }

  const handleUnarchive = async (post: PostListItem) => {
    if (!token) return
    setUnarchiving(post.uuid)
    try {
      await postsApi.unarchive(token, post.uuid)
      // Post draft ga o'tdi — local state'da statusini yangilaymiz
      setAllData((prev) =>
        prev
          ? { ...prev, items: prev.items.map((p) => p.uuid === post.uuid ? { ...p, status: "draft" as const } : p) }
          : prev,
      )
      toast.success(`"${post.title || "Sarlavsiz"}" qoralamaga qaytarildi`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Arxivdan chiqarishda xatolik")
    } finally {
      setUnarchiving(null)
    }
  }

  const patchPost = (uuid: string, patch: Partial<PostListItem>) => {
    setAllData((prev) =>
      prev
        ? { ...prev, items: prev.items.map((p) => p.uuid === uuid ? { ...p, ...patch } : p) }
        : prev,
    )
  }

  const handlePublishNow = async (post: PostListItem) => {
    if (!token) return
    setActing(post.uuid)
    try {
      const updated = await postsApi.publishNow(token, post.uuid)
      patchPost(post.uuid, updated)
      toast.success("Maqola nashr qilindi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nashr qilishda xatolik")
    } finally {
      setActing(null)
    }
  }

  const handleCancelSchedule = async (post: PostListItem) => {
    if (!token) return
    setActing(post.uuid)
    try {
      const updated = await postsApi.cancelSchedule(token, post.uuid)
      patchPost(post.uuid, updated)
      toast.success("Reja bekor qilindi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rejani bekor qilishda xatolik")
    } finally {
      setActing(null)
    }
  }

  const handleRetryPublish = async (post: PostListItem) => {
    if (!token) return
    setActing(post.uuid)
    try {
      const updated = await postsApi.retryPublish(token, post.uuid)
      patchPost(post.uuid, updated)
      toast.success("Qayta nashr qilindi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Qayta urinishda xatolik")
    } finally {
      setActing(null)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingDots size="lg" className="text-primary" />
      </div>
    )
  }

  return (
    <>
      {deleteTarget && (
        <ConfirmModal
          title="Maqolani o'chirish"
          description={`"${deleteTarget.title || "Sarlavsiz"}" maqolasi butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.`}
          confirmLabel={deleting ? "O'chirilmoqda…" : "O'chirish"}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
        />
      )}

      <div className="min-h-full py-4 sm:py-6 lg:py-8" style={{ background: "var(--color-bg-muted)" }}>
        <DashboardContainer className="space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium text-primary">Kontent boshqaruvi</p>
              <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-text-primary sm:text-[28px]">
                Maqolalarim
              </h1>
              <p className="mt-0.5 text-sm text-text-muted">Barcha maqolalaringizni boshqaring.</p>
            </div>
            <Link
              href="/write"
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,var(--color-inkly-orange),var(--color-inkly-coral))",
                boxShadow: "0 1px 0 rgba(255,255,255,0.15) inset, 0 3px 10px rgba(255,106,0,0.30)",
              }}
            >
              <Plus size={13} />
              Yangi maqola
            </Link>
          </div>

          {/* List */}
          <Card variant="panel" className="overflow-hidden">
            {/* Tab bar */}
            <TabBar active={activeTab} onChange={handleTabChange} />

            {fetching ? (
              <div className="flex justify-center py-20">
                <LoadingDots size="lg" className="text-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <p className="text-sm text-red-500">{error}</p>
                <button
                  onClick={fetchPosts}
                  className="text-sm font-semibold text-primary underline underline-offset-4"
                >
                  Qayta urinish
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-default bg-bg-muted">
                  <BookOpen size={18} className="text-border-default" />
                </div>
                <p className="text-sm text-text-muted">
                  {activeTab === "all" ? "Hali maqola yo'q." : "Bu filtrdagi maqolalar yo'q."}
                </p>
                <Link href="/write" className="text-sm font-semibold text-primary underline underline-offset-4">
                  Birinchi maqolangizni yozing →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-bg-muted">
                {filteredItems.map((post) => (
                  <PostRow
                    key={post.uuid}
                    post={post}
                    onRequestDelete={() => setDeleteTarget(post)}
                    onUnarchive={() => handleUnarchive(post)}
                    onPublishNow={() => handlePublishNow(post)}
                    onCancelSchedule={() => handleCancelSchedule(post)}
                    onRetryPublish={() => handleRetryPublish(post)}
                    isUnarchiving={unarchiving === post.uuid}
                    isActing={acting === post.uuid}
                  />
                ))}
              </div>
            )}
          </Card>

          {allData && allData.total_pages > 1 && (
            <Pagination page={allData.page} totalPages={allData.total_pages} basePath="/dashboard/posts" query={activeTab !== "all" ? { tab: activeTab } : {}} />
          )}
        </DashboardContainer>
      </div>
    </>
  )
}

function PostRow({
  post, onRequestDelete, onUnarchive, onPublishNow, onCancelSchedule, onRetryPublish, isUnarchiving, isActing,
}: {
  post: PostListItem
  onRequestDelete(): void
  onUnarchive(): void
  onPublishNow(): void
  onCancelSchedule(): void
  onRetryPublish(): void
  isUnarchiving: boolean
  isActing: boolean
}) {
  const postUrl = localPostHref(post)
  const badge = STATUS_BADGE[post.status] ?? STATUS_BADGE.draft
  const isArchived = post.status === "archived"

  return (
    <article className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-white sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/write?edit=${post.uuid}`}
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
            {formatDate(post.updated_at)}
          </span>
          {post.status === "published" && (
            <>
              <span className="flex items-center gap-1"><Eye size={10} /> {formatCount(post.views_count)}</span>
              <span className="flex items-center gap-1"><Heart size={10} /> {formatCount(post.likes_count)}</span>
              <span className="flex items-center gap-1"><MessageCircle size={10} /> {formatCount(post.comments_count)}</span>
            </>
          )}
          {post.status === "scheduled" && post.scheduled_at && (
            <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(post.scheduled_at)}</span>
          )}
          {post.status === "failed" && post.last_publish_error && (
            <span className="text-red-500">{post.last_publish_error}</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:ml-auto">
        {post.status === "published" && post.slug && (
          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Ko'rish"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-default px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:bg-bg-muted hover:text-primary"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Ko'rish</span>
          </a>
        )}

        {post.status === "scheduled" && (
          <>
            <button
              onClick={onPublishNow}
              disabled={isActing}
              title="Hozir nashr qilish"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-default px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:bg-bg-muted hover:text-primary disabled:opacity-50"
            >
              <Send size={13} />
              <span className="hidden sm:inline">Hozir</span>
            </button>
            <button
              onClick={onCancelSchedule}
              disabled={isActing}
              title="Rejani bekor qilish"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-default px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:bg-bg-muted hover:text-primary disabled:opacity-50"
            >
              <XCircle size={13} />
              <span className="hidden sm:inline">Bekor</span>
            </button>
          </>
        )}

        {post.status === "failed" && (
          <button
            onClick={onRetryPublish}
            disabled={isActing}
            title="Qayta urinish"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-default px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:bg-bg-muted hover:text-primary disabled:opacity-50"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Retry</span>
          </button>
        )}

        {/* Arxivlangan postni qoralamaga qaytarish */}
        {isArchived ? (
          <button
            onClick={onUnarchive}
            disabled={isUnarchiving}
            title="Qoralamaga qaytarish"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-default px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:bg-bg-muted hover:text-primary disabled:opacity-50"
          >
            {isUnarchiving ? (
              <LoadingDots size="sm" className="text-primary" />
            ) : (
              <>
                <ArchiveRestore size={13} />
                <span className="hidden sm:inline">Qaytarish</span>
              </>
            )}
          </button>
        ) : (
          <Link
            href={`/write?edit=${post.uuid}`}
            title="Tahrirlash"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-default px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:bg-bg-muted hover:text-primary"
          >
            <PenLine size={13} />
            <span className="hidden sm:inline">Tahrirlash</span>
          </Link>
        )}

        <button
          onClick={onRequestDelete}
          title="O'chirish"
          className="inline-flex items-center justify-center rounded-xl p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  )
}
