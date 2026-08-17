"use client"

import { useState } from "react"
import { Heart, ThumbsDown, Share2, Check } from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { formatCount } from "@/lib/utils/format"
import type { PostReactionType, PostResponse } from "@/types/api"

export function PostActions({ post }: { post: PostResponse }) {
  const { state } = useAuth()
  const { user, token } = state

  // Optimistic UI — avval UI yangilanadi
  const [reacted, setReacted] = useState<PostReactionType | null>(post.reacted)
  const [likes, setLikes] = useState(post.likes_count)
  const [dislikes, setDislikes] = useState(post.dislikes_count)
  const [actionLoading, setActionLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleReact = async (type: "like" | "dislike") => {
    if (!token || actionLoading) return
    setActionLoading(true)

    // Optimistic update
    const prevReacted = reacted
    const prevLikes = likes
    const prevDislikes = dislikes

    if (reacted === type) {
      // Ikki marta bosilsa — reaksiyani olib tashlash
      setReacted(null)
      if (type === "like") setLikes((n) => Math.max(0, n - 1))
      else setDislikes((n) => Math.max(0, n - 1))
    } else {
      // Boshqa reaksiyadan o'tish yoki yangi reaksiya
      if (reacted === "like") setLikes((n) => Math.max(0, n - 1))
      if (reacted === "dislike") setDislikes((n) => Math.max(0, n - 1))
      setReacted(type)
      if (type === "like") setLikes((n) => n + 1)
      else setDislikes((n) => n + 1)
    }

    try {
      let res
      if (reacted === type) {
        // Toggle off
        res = await postsApi.removeReaction(post.slug, token)
      } else if (type === "like") {
        res = await postsApi.like(post.slug, token)
      } else {
        res = await postsApi.dislike(post.slug, token)
      }
      // Backend javobidan to'g'ri qiymatlarni olamiz
      setReacted(res.reacted)
      setLikes(res.likes_count)
      setDislikes(res.dislikes_count)
    } catch {
      // Xato bo'lsa orqaga qaytamiz
      setReacted(prevReacted)
      setLikes(prevLikes)
      setDislikes(prevDislikes)
    } finally {
      setActionLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: post.title, url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Like */}
      <button
        onClick={() => handleReact("like")}
        disabled={!user || actionLoading}
        aria-label={`Like — ${likes}`}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
          reacted === "like"
            ? "border-red-200 bg-red-50 text-red-500"
            : "border-[#E8E3DD] text-[#36565F] hover:border-red-200 hover:bg-red-50 hover:text-red-500"
        }`}
      >
        <Heart size={15} className={reacted === "like" ? "fill-current" : ""} />
        {formatCount(likes)}
      </button>

      {/* Dislike */}
      <button
        onClick={() => handleReact("dislike")}
        disabled={!user || actionLoading}
        aria-label={`Dislike — ${dislikes}`}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
          reacted === "dislike"
            ? "border-[#6B7280]/40 bg-[#F2F4F7] text-[#141414]"
            : "border-[#E8E3DD] text-[#6B7280] hover:border-[#6B7280]/40 hover:bg-[#F2F4F7]"
        }`}
      >
        <ThumbsDown size={15} className={reacted === "dislike" ? "fill-current" : ""} />
        {formatCount(dislikes)}
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        aria-label="Ulashish"
        className="ml-auto flex items-center gap-2 rounded-full border border-[#E8E3DD] px-4 py-2 text-sm font-medium text-[#36565F] transition-colors hover:border-[#FF6A00] hover:text-[#FF6A00]"
      >
        {copied ? (
          <><Check size={15} className="text-green-500" /> Nusxalandi</>
        ) : (
          <><Share2 size={15} /> Ulashish</>
        )}
      </button>
    </div>
  )
}
