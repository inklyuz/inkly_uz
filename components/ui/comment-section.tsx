"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/input"
import { postsApi } from "@/lib/api/posts"
import { useAuth } from "@/lib/auth/context"
import { timeAgo } from "@/lib/utils/format"
import type { CommentResponse } from "@/types/api"
import { LoadingDots } from "@/components/ui/loading-dots"

interface CommentSectionProps {
  postId: number
}

const PAGE_SIZE = 20

export function CommentSection({ postId }: CommentSectionProps) {
  const { state } = useAuth()
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    postsApi
      .getCommentsById(postId, { page: 1, page_size: PAGE_SIZE })
      .then((res) => {
        if (!active) return
        setComments(res.items)
        setTotalCount(res.total)
        setHasMore(res.page < res.total_pages)
        setPage(1)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [postId])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const res = await postsApi.getCommentsById(postId, {
        page: nextPage,
        page_size: PAGE_SIZE,
      })
      setComments((prev) => [...prev, ...res.items])
      setTotalCount(res.total)
      setHasMore(res.page < res.total_pages)
      setPage(nextPage)
    } catch {
      // silent
    } finally {
      setLoadingMore(false)
    }
  }, [postId, page, hasMore, loadingMore])

  const submit = async () => {
    const content = value.trim()
    if (!content) return
    if (!state.token) {
      setError("Izoh yozish uchun hisobingizga kiring")
      return
    }
    setSending(true)
    setError(null)
    try {
      const comment = await postsApi.addCommentById(postId, content, state.token)
      setComments((prev) => [comment, ...prev])
      setTotalCount((n) => n + 1)
      setValue("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Izohni yuborib bo'lmadi")
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (commentUuid: string) => {
    if (!state.token) return
    try {
      await postsApi.deleteCommentById(postId, commentUuid, state.token)
      setComments((prev) => prev.filter((c) => c.uuid !== commentUuid))
      setTotalCount((n) => Math.max(0, n - 1))
    } catch (err: unknown) {
      console.error("Comment delete error:", err)
    }
  }

  return (
    // w-full — post kengligi bilan bir xil (ota element boshqaradi)
    <section aria-labelledby="comments-heading" className="w-full space-y-6">

      {/* ── Sarlavha ── */}
      <div className="flex items-center gap-3">
        <h2
          id="comments-heading"
          className="text-lg font-semibold text-text-primary"
        >
          Izohlar
        </h2>
        {totalCount > 0 && (
          <span className="rounded-full bg-bg-muted px-2.5 py-0.5 text-sm font-medium text-text-muted">
            {totalCount}
          </span>
        )}
      </div>

      {/* ── Izoh yozish ── */}
      {state.token ? (
        <div className="w-full space-y-3">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Textarea
            name="comment"
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Fikringizni yozing…"
            aria-label="Izoh matni"
            className="w-full"
          />
          <div className="flex justify-end">
            <Button loading={sending} onClick={submit} disabled={!value.trim()}>
              Izoh qoldirish
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-xl border border-border-default bg-bg-muted px-5 py-4 text-sm text-text-secondary">
          Izoh yozish uchun{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline underline-offset-4 hover:text-inkly-hover"
          >
            hisobingizga kiring
          </Link>
          .
        </div>
      )}

      {/* ── Izohlar ro'yxati ── */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingDots size="lg" className="text-primary" />
        </div>
      ) : (
        <div className="w-full space-y-0">
          <ul className="w-full divide-y divide-border-default">
            {comments.length === 0 && (
              <li className="py-10 text-center text-sm text-text-muted">
                Hali izoh yo&apos;q — birinchi bo&apos;ling!
              </li>
            )}
            {comments.map((comment) => (
              <li key={comment.uuid} className="flex gap-4 py-5">
                <Avatar
                  src={comment.author.avatar}
                  name={comment.author.full_name}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Link
                      href={`/@${comment.author.username}`}
                      className="text-sm font-semibold text-text-primary hover:text-primary"
                    >
                      {comment.author.full_name}
                    </Link>
                    <span className="text-xs text-text-muted">
                      {timeAgo(comment.created_at)}
                    </span>
                    {state.user?.username === comment.author.username && (
                      <button
                        onClick={() => handleDelete(comment.uuid)}
                        className="ml-auto text-xs text-text-muted transition-colors hover:text-red-500"
                      >
                        O'chirish
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                    {comment.content}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* ── Ko'proq yuklash ── */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-xl border border-border-default bg-white px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
              >
                {loadingMore ? (
                  <LoadingDots size="sm" />
                ) : (
                  <ChevronDown size={14} />
                )}
                Ko'proq izohlar
                {totalCount - comments.length > 0 && (
                  <span className="rounded-full bg-bg-muted px-2 py-0.5 text-[11px] font-semibold text-text-muted">
                    {totalCount - comments.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}