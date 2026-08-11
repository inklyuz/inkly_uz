"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/input"
import { postsApi } from "@/lib/api/posts"
import { useAuth } from "@/lib/auth/context"
import { timeAgo } from "@/lib/utils/format"
import type { CommentResponse } from "@/types/api"

interface CommentSectionProps {
  slug: string
  initialComments: CommentResponse[]
  totalCount: number
}

export function CommentSection({ slug, initialComments, totalCount }: CommentSectionProps) {
  const { state } = useAuth()
  const [comments, setComments] = useState(initialComments)
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)

  const submit = async () => {
    const content = value.trim()
    if (!content) return
    if (!state.token) {
      toast.error("Izoh yozish uchun hisobingizga kiring")
      return
    }
    setSending(true)
    try {
      const comment = await postsApi.addComment(slug, content, state.token)
      setComments((prev) => [comment, ...prev])
      setValue("")
      toast.success("Izoh qo'shildi")
    } catch (error) {
      toast.error((error as Error)?.message ?? "Izohni yuborib bo'lmadi")
    } finally {
      setSending(false)
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-6">
      <h2 id="comments-heading" className="text-sm font-semibold uppercase tracking-widest text-ink-400">
        Izohlar · {Math.max(totalCount, comments.length)}
      </h2>

      {state.token ? (
        <div className="flex flex-col items-end gap-3">
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
        <div className="rounded-xl border border-cream-300 bg-cream-200 px-5 py-4 text-sm text-ink-600">
          Izoh yozish uchun{" "}
          <Link href="/login" className="font-medium text-ink-900 underline underline-offset-4">
            hisobingizga kiring
          </Link>
          .
        </div>
      )}

      <ul className="flex flex-col divide-y divide-cream-300">
        {comments.length === 0 && <li className="py-8 text-center text-sm text-ink-400">Hali izoh yo'q</li>}
        {comments.map((comment) => (
          <li key={comment.uuid} className="flex gap-3 py-5">
            <Avatar src={comment.author.avatar} name={comment.author.full_name} size={36} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/@${comment.author.username}`} className="text-sm font-medium text-ink-900">
                  {comment.author.full_name}
                </Link>
                <span className="text-xs text-ink-400">{timeAgo(comment.created_at)}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{comment.content}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
