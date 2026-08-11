"use client"

import Link from "next/link"
import { Heart, Users, Clock, TrendingUp, Share2, PenLine } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

const iconConfig = {
  heart: {
    Icon: Heart,
    iconColor: "text-ink-600",
    iconBg: "bg-cream-100",
    isHeart: true,
  },
  users: {
    Icon: Users,
    iconColor: "text-lime-600",
    iconBg: "bg-lime-50",
    isHeart: false,
  },
  clock: {
    Icon: Clock,
    iconColor: "text-ink-600",
    iconBg: "bg-cream-100",
    isHeart: false,
  },
  trending: {
    Icon: TrendingUp,
    iconColor: "text-lime-600",
    iconBg: "bg-lime-50",
    isHeart: false,
  },
  share: {
    Icon: Share2,
    iconColor: "text-ink-600",
    iconBg: "bg-cream-100",
    isHeart: false,
  },
  pen: {
    Icon: PenLine,
    iconColor: "text-lime-600",
    iconBg: "bg-lime-50",
    isHeart: false,
  },
}

/* ── Instagram-like yurak animatsiyasi ────────────────────────────── */
function HeartIcon({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  return (
    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
      {/* Ripple 1 — tashqi */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-ink-400"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: [1, 1.9], opacity: [0.45, 0] }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            repeatDelay: 2.3,
            ease: "easeOut",
            delay: 1.2,
          }}
        />
      )}
      {/* Ripple 2 — ichki */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-ink-300"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2.3,
            ease: "easeOut",
            delay: 1.3,
          }}
        />
      )}
      {/* Yurak icon — bounce pop animatsiyasi */}
      <motion.div
        className="relative z-10 flex h-7 w-7 items-center justify-center rounded-xl bg-cream-100"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                scale: [1, 1, 1.45, 0.88, 1.18, 1],
                rotate: [0, 0, -8, 4, -2, 0],
              }
        }
        transition={{
          duration: 0.55,
          repeat: Infinity,
          repeatDelay: 2.45,
          ease: "easeInOut",
          delay: 1.2,
          times: [0, 0.05, 0.3, 0.55, 0.75, 1],
        }}
      >
        <Heart size={13} className="fill-ink-600 text-ink-600" />
      </motion.div>
    </div>
  )
}

export function FloatingBadge({
  className,
  icon,
  label,
  sub,
  href,
  entranceDelay = 0,
  floatDuration = 3,
  floatOffset = 8,
}: {
  className?: string
  icon: keyof typeof iconConfig
  label: string
  sub?: string
  href?: string
  entranceDelay?: number
  floatDuration?: number
  floatOffset?: number
}) {
  const { Icon, iconColor, iconBg, isHeart } = iconConfig[icon]
  const prefersReducedMotion = useReducedMotion()

  const content = (
    <motion.div
      className={cn(
        "pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-cream-200 bg-white px-3.5 py-2.5 shadow-[0_2px_12px_rgba(9,60,93,0.08)]",
        href && "cursor-pointer",
      )}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.06, y: -2 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Icon */}
      {isHeart ? (
        <HeartIcon prefersReducedMotion={prefersReducedMotion} />
      ) : (
        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-xl", iconBg)}>
          <Icon size={13} className={iconColor} />
        </div>
      )}
      {/* Matn */}
      <div className="leading-tight">
        <p className="text-xs font-bold text-ink-900">{label}</p>
        {sub && <p className="text-[10px] text-ink-600/60">{sub}</p>}
      </div>
    </motion.div>
  )

  return (
    <motion.div
      className={cn("absolute z-30", className)}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: entranceDelay, ease: "easeOut" }}
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, -floatOffset, 0] }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: entranceDelay + 0.5,
        }}
      >
        {href ? <Link href={href}>{content}</Link> : content}
      </motion.div>
    </motion.div>
  )
}