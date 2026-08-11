import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "lime" | "muted" | "outline"
  className?: string
}

const variants = {
  default: "bg-cream-200 text-ink-600",
  lime: "bg-lime-400 text-ink-900",
  muted: "bg-cream-300 text-ink-400",
  outline: "border border-cream-400 text-ink-600",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", variants[variant], className)}
    >
      {children}
    </span>
  )
}

export function VerifiedDot({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)} title="Tasdiqlangan">
      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-lime-400" />
      <span className="sr-only">Tasdiqlangan muallif</span>
    </span>
  )
}
