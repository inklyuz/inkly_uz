import { Loader2 } from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "ghost" | "destructive" | "onDark"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  children: ReactNode
}

const variants = {
  // Primary: Jet Black bg — editorial / secondary CTA
  primary:
    "bg-[#141414] text-white hover:bg-[#141414]/90",
  // Accent: Sunset Orange — main CTA (Boshlash, Yozish, Saqlash)
  accent:
    "bg-[#FF6A00] text-white font-semibold hover:bg-[#E85F00]",
  // Ghost: transparent with border
  ghost:
    "bg-transparent border border-[#E8E3DD] text-[#141414] hover:bg-[#FFF3E8] hover:border-[#FF6A00] hover:text-[#FF6A00]",
  // Destructive: error state
  destructive:
    "bg-transparent border border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/5",
  // OnDark: used on dark (navbar/footer) backgrounds
  onDark:
    "bg-transparent border border-white/20 text-white hover:bg-white/10",
}

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6A00]",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {loading && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
