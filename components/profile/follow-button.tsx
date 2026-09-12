"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, UserCheck, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import { followsApi } from "@/lib/api/follows"
import { ACCENT_COLOR } from "@/lib/theme/accent"

interface FollowButtonProps {
  targetSlug: string
  initialIsFollowing: boolean
  initialFollowersCount: number
  /**
   * "dark"  = shaffof/qora overlay ustida (masalan rasm ustida turadigan joy)
   * "light" = oq/och fon ustida (mobil hero matn qismi, desktop header) — DEFAULT
   * Sahifadagi deyarli barcha joylashuvlar oq fon ustida bo'lgani uchun
   * default endi "light".
   */
  variant?: "dark" | "light"
  /** variant="light" bo'lganda follow holatidagi fon rangi. Berilmasa, ACCENT_COLOR (avatardan chiqqan rang) ishlatiladi. */
  accentColor?: string
}

export function FollowButton({
  targetSlug,
  initialIsFollowing,
  initialFollowersCount,
  variant = "light",
  accentColor,
}: FollowButtonProps) {
  const { state } = useAuth()
  const { token, user } = state
  const router = useRouter()

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

  // Foydalanuvchi o'z profilida tugmani ko'rmasin
  if (user?.slug === targetSlug || user?.username === targetSlug) return null

  const handleClick = async () => {
    if (!token) {
      router.push("/login")
      return
    }
    if (loading) return
    setLoading(true)

    const wasFollowing = isFollowing
    const prevCount = followersCount

    // Optimistic update
    setIsFollowing(!wasFollowing)
    setFollowersCount(wasFollowing ? Math.max(0, prevCount - 1) : prevCount + 1)

    try {
      if (wasFollowing) {
        await followsApi.unfollow(token, targetSlug)
      } else {
        await followsApi.follow(token, targetSlug)
      }
      startTransition(() => router.refresh())
    } catch {
      // Rollback on error
      setIsFollowing(wasFollowing)
      setFollowersCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  const isLight = variant === "light"

  const baseClass =
    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60"

  const stateClass = isLight
    ? isFollowing
      ? "border border-[#EDE8E3] bg-white text-[#30363B] hover:bg-red-50 hover:border-red-200 hover:text-red-600"
      : "text-white shadow-sm hover:opacity-90 hover:shadow-md"
    : isFollowing
      ? "border border-white/30 bg-white/10 text-white hover:bg-destructive/20 hover:border-destructive/40 hover:text-red-200"
      : "bg-white text-foreground hover:bg-white/90"

  const inlineStyle: React.CSSProperties | undefined =
    isLight && !isFollowing
      ? { background: accentColor ?? ACCENT_COLOR }
      : undefined

  return (
    <button
      onClick={handleClick}
      disabled={loading || isPending}
      style={inlineStyle}
      className={`${baseClass} ${stateClass}`}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isFollowing ? (
        <UserCheck size={14} />
      ) : (
        <UserPlus size={14} />
      )}
      {isFollowing ? "Kuzatilmoqda" : "Kuzatish"}
    </button>
  )
}
