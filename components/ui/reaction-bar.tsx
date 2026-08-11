"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, ThumbsDown } from "lucide-react"
import { toast } from "sonner"
import { postsApi } from "@/lib/api/posts"
import { useAuth } from "@/lib/auth/context"
import { cn } from "@/lib/utils"
import { formatCount } from "@/lib/utils/format"
import type { PostReactionType } from "@/types/api"

interface ReactionBarProps {
  slug: string
  initialLikes: number
  initialDislikes: number
  initialReacted: PostReactionType | null
}

export function ReactionBar({ slug, initialLikes, initialDislikes, initialReacted }: ReactionBarProps) {
  const { state } = useAuth()
  const router = useRouter()
  const [reacted, setReacted] = useState(initialReacted)
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [pending, setPending] = useState(false)

  const token = state.token

  const handleReaction = async (type: PostReactionType) => {
    if (!token) {
      toast.error("Reaksiya qoldirish uchun hisobingizga kiring")
      router.push("/login")
      return
    }
    setPending(true)
    try {
      const result =
        reacted === type
          ? await postsApi.removeReaction(slug, token)
          : type === "like"
            ? await postsApi.like(slug, token)
            : await postsApi.dislike(slug, token)

      setReacted(result.reacted)
      setLikes(result.likes_count)
      setDislikes(result.dislikes_count)
    } catch (error) {
      toast.error((error as Error)?.message ?? "Amalni bajarib bo'lmadi")
    } finally {
      setPending(false)
    }
  }

  const pill = "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => handleReaction("like")}
        aria-pressed={reacted === "like"}
        className={cn(pill, reacted === "like" ? "bg-lime-400 text-ink-900" : "bg-cream-200 text-ink-600 hover:bg-cream-300")}
      >
        <Heart size={15} className={reacted === "like" ? "fill-ink-900" : ""} />
        {formatCount(likes)} Yoqdi
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => handleReaction("dislike")}
        aria-pressed={reacted === "dislike"}
        className={cn(pill, reacted === "dislike" ? "bg-cream-400 text-ink-900" : "bg-cream-200 text-ink-600 hover:bg-cream-300")}
      >
        <ThumbsDown size={15} />
        {formatCount(dislikes)} Yoqmadi
      </button>
    </div>
  )
}
