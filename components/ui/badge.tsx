import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "lime" | "muted" | "outline"
  className?: string
}

const variants = {
  // default: soft orange light bg — category, label
  default: "bg-[#FFF3E8] text-[#FF6A00]",
  // lime → orange primary — "Tanlangan", "Tasdiqlangan" kabi
  lime: "bg-[#FF6A00] text-white",
  // muted: subtle gray
  muted: "bg-[#F2F4F7] text-[#6B7280]",
  // outline: border only
  outline: "border border-[#E8E3DD] text-[#36565F]",
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
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
