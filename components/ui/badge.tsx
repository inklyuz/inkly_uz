import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "lime" | "muted" | "outline" | "ghost"
  className?: string
}

const variants = {
  // default: soft orange light bg — category, label
  default: "bg-accent text-primary",
  lime: "bg-primary text-primary-foreground",
  muted: "bg-muted text-text-muted",
  outline: "border border-border text-text-secondary",
  ghost: "bg-transparent text-text-secondary",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium leading-5",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function VerifiedDot({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)} title="Tasdiqlangan">
      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#FF6A00]" />
      <span className="sr-only">Tasdiqlangan muallif</span>
    </span>
  )
}
