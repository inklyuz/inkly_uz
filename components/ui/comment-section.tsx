"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/input"
import { postsApi } from "@/lib/api/posts"
import { useAuth } from "@/lib/auth/context"
import { timeAgo } from "@/lib/utils/format"
import type { CommentResponse } from "@/types/api"

interface CommentSectionProps {
  postSlug: string
}

export function CommentSection({ postSlug }: CommentSectionProps) {
  const { state } = useAuth()
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    postsApi.getComments(postSlug, { page_size: 20 }).then((page) => {
      setComments(page.items)
      setTotalCount(page.total)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [postSlug])

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
      const comment = await postsApi.addComment(postSlug, content, state.token)
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
      await postsApi.deleteComment(postSlug, commentUuid, state.token)
      setComments((prev) => prev.filter((c) => c.uuid !== commentUuid))
      setTotalCount((n) => Math.max(0, n - 1))
    } catch (err: unknown) {
      console.error("Comment delete error:", err)
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-6">
      <h2 id="comments-heading" className="text-sm font-semibold uppercase tracking-widest text-[#6B7280]">
        Izohlar · {totalCount}
      </h2>

      {state.token ? (
        <div className="flex flex-col items-end gap-3">
          {error && <p className="w-full text-sm text-red-500">{error}</p>}
          <Textarea
            name="comment"
            rows={3}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Fikringizni yozing…"
            aria-label="Izoh matni"
          />
          <Button loading={sending} onClick={submit} disabled={!value.trim()}>
            Izoh qoldirish
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E8E3DD] bg-[#F2F4F7] px-5 py-4 text-sm text-[#36565F]">
          Izoh yozish uchun{" "}
          <Link href="/login" className="font-medium text-[#FF6A00] underline underline-offset-4 hover:text-[#E85F00]">
            hisobingizga kiring
          </Link>
          .
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-[#FF6A00]" />
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-[#E8E3DD]">
          {comments.length === 0 && (
            <li className="py-8 text-center text-sm text-[#6B7280]">Hali izoh yo&apos;q</li>
          )}
          {comments.map((comment) => (
            <li key={comment.uuid} className="flex gap-3 py-5">
              <Avatar src={comment.author.avatar} name={comment.author.full_name} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/@${comment.author.username}`}
                    className="text-sm font-medium text-[#141414] hover:text-[#FF6A00]"
                  >
                    {comment.author.full_name}
                  </Link>
                  <span className="text-xs text-[#6B7280]">{timeAgo(comment.created_at)}</span>

                  {/* O'z izohi bo'lsa o'chirish tugmasi */}
                  {state.user?.username === comment.author.username && (
                    <button
                      onClick={() => handleDelete(comment.uuid)}
                      className="ml-auto text-xs text-[#6B7280] hover:text-red-500 transition-colors"
                    >
                      O'chirish
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-[#36565F]">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
