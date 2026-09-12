"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Heart, ThumbsDown, Share2, X, Link2, Check } from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { formatCount } from "@/lib/utils/format"
import type { PostReactionType, PostResponse } from "@/types/api"

// ─── Ikonkalar ────────────────────────────────────────────────────────────────

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

// ─── Telegram preview komponenti ──────────────────────────────────────────────

function TelegramPreview({
  url,
  title,
  description,
  cover,
}: {
  url: string
  title: string
  description: string
  cover?: string | null
}) {
  const domain = url.replace(/^https?:\/\//, "").split("/")[0]

  return (
    <div className="mt-3 overflow-hidden rounded-xl border-l-4 border-[#229ED9] bg-[#f0f8ff] text-left">
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="h-36 w-full object-cover" />
      )}
      <div className="px-3 py-2.5">
        <p className="text-[11px] text-[#229ED9]">{domain}</p>
        <p className="mt-0.5 text-[13px] font-semibold leading-snug text-[#111]">
          {title}
        </p>
        {description && (
          <p className="mt-0.5 line-clamp-2 text-[12px] text-[#555]">{description}</p>
        )}
      </div>
    </div>
  )
}

// ─── Share modal ──────────────────────────────────────────────────────────────

function ShareModal({
  open,
  onClose,
  url,
  title,
  description,
  cover,
}: {
  open: boolean
  onClose: () => void
  url: string
  title: string
  description: string
  cover?: string | null
}) {
  const [copied, setCopied] = useState(false)
  const [telegramHovered, setTelegramHovered] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // ESC bilan yopish
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const platforms = [
    {
      key: "telegram",
      label: "Telegram",
      icon: <TelegramIcon />,
      href: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`,
      bg: "bg-[#229ED9]",
      hoverBg: "hover:bg-[#1a8ec9]",
    },
    {
      key: "twitter",
      label: "X",
      icon: <TwitterIcon />,
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      bg: "bg-black",
      hoverBg: "hover:bg-[#111]",
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: <FacebookIcon />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      bg: "bg-[#1877F2]",
      hoverBg: "hover:bg-[#1565d8]",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: <LinkedInIcon />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      bg: "bg-[#0A66C2]",
      hoverBg: "hover:bg-[#0958aa]",
    },
  ]

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    /* Overlay */
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
      aria-modal="true"
      role="dialog"
      aria-label="Ulashish"
    >
      {/* Modal */}
      <div className="w-full max-w-sm rounded-t-3xl bg-white px-6 pb-8 pt-5 shadow-2xl sm:rounded-3xl">
        {/* Drag handle (mobil) */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-default sm:hidden" />

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">Ulashish</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-bg-muted hover:text-text-primary"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        {/* Platforma tugmalari */}
        <div className="flex items-center justify-between gap-2">
          {platforms.map((p) => (
            <a
              key={p.key}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              title={p.label}
              aria-label={`${p.label} orqali ulashish`}
              onMouseEnter={() => p.key === "telegram" && setTelegramHovered(true)}
              onMouseLeave={() => p.key === "telegram" && setTelegramHovered(false)}
              className={[
                "flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-3 text-white transition-colors",
                p.bg,
                p.hoverBg,
              ].join(" ")}
            >
              {p.icon}
              <span className="text-[11px] font-medium">{p.label}</span>
            </a>
          ))}
        </div>

        {/* Telegram preview — hover yoki mobilda har doim */}
        {telegramHovered && (
          <TelegramPreview
            url={url}
            title={title}
            description={description}
            cover={cover}
          />
        )}

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border-default" />
          <span className="text-xs text-text-muted">yoki havolani nusxalash</span>
          <div className="h-px flex-1 bg-border-default" />
        </div>

        {/* URL + nusxalash */}
        <div className="flex items-center gap-2 rounded-xl border border-border-default bg-bg-muted px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-[13px] text-text-muted">
            {url}
          </span>
          <button
            onClick={handleCopy}
            aria-label="Havolani nusxalash"
            className={[
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all",
              copied
                ? "bg-green-100 text-green-700"
                : "bg-white text-text-primary shadow-sm hover:bg-primary hover:text-white",
            ].join(" ")}
          >
            {copied ? (
              <><Check size={13} /> Nusxalandi</>
            ) : (
              <><Link2 size={13} /> Nusxalash</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Asosiy PostActions ────────────────────────────────────────────────────────

export function PostActions({
  post,
  cover,
}: {
  post: PostResponse
  cover?: string | null
}) {
  const { state } = useAuth()
  const { user, token } = state
  const router = useRouter()

  const [reacted, setReacted] = useState<PostReactionType | null>(post.reacted)
  const [likes, setLikes] = useState(post.likes_count)
  const [dislikes, setDislikes] = useState(post.dislikes_count)
  const [actionLoading, setActionLoading] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const postUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://inkly.uz/posts/${post.id}`

  const handleReact = async (type: "like" | "dislike") => {
    if (!token) { router.push("/login"); return }
    if (actionLoading) return
    setActionLoading(true)

    const prevReacted = reacted
    const prevLikes = likes
    const prevDislikes = dislikes

    if (reacted === type) {
      setReacted(null)
      if (type === "like") setLikes((n) => Math.max(0, n - 1))
      else setDislikes((n) => Math.max(0, n - 1))
    } else {
      if (reacted === "like") setLikes((n) => Math.max(0, n - 1))
      if (reacted === "dislike") setDislikes((n) => Math.max(0, n - 1))
      setReacted(type)
      if (type === "like") setLikes((n) => n + 1)
      else setDislikes((n) => n + 1)
    }

    try {
      let res
      if (reacted === type) res = await postsApi.removeReactionById(post.id, token)
      else if (type === "like") res = await postsApi.likeById(post.id, token)
      else res = await postsApi.dislikeById(post.id, token)
      setReacted(res.reacted)
      setLikes(res.likes_count)
      setDislikes(res.dislikes_count)
    } catch {
      setReacted(prevReacted)
      setLikes(prevLikes)
      setDislikes(prevDislikes)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {/* Like */}
        <button
          onClick={() => handleReact("like")}
          disabled={actionLoading}
          aria-label={`Like — ${likes}`}
          title={!user ? "Like bosish uchun hisobingizga kiring" : undefined}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
            reacted === "like"
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-border-default text-text-secondary hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          }`}
        >
          <Heart size={15} className={reacted === "like" ? "fill-current" : ""} />
          {formatCount(likes)}
        </button>

        {/* Dislike */}
        <button
          onClick={() => handleReact("dislike")}
          disabled={actionLoading}
          aria-label={`Dislike — ${dislikes}`}
          title={!user ? "Dislike bosish uchun hisobingizga kiring" : undefined}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
            reacted === "dislike"
              ? "border-text-muted/40 bg-bg-muted text-text-primary"
              : "border-border-default text-text-muted hover:border-text-muted/40 hover:bg-bg-muted"
          }`}
        >
          <ThumbsDown size={15} className={reacted === "dislike" ? "fill-current" : ""} />
          {formatCount(dislikes)}
        </button>

        {/* Ulashish */}
        <button
          onClick={() => setShareOpen(true)}
          aria-label="Ulashish"
          className="ml-auto flex items-center gap-2 rounded-full border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
        >
          <Share2 size={15} />
          Ulashish
        </button>
      </div>

      {/* Share modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={postUrl}
        title={post.title}
        description={post.excerpt ?? ""}
        cover={cover}
      />
    </>
  )
}