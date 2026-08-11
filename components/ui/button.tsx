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
  primary: "bg-ink-900 text-cream-100 hover:bg-ink-900/90",
  accent: "bg-lime-400 text-ink-900 font-semibold hover:bg-lime-500",
  ghost: "bg-transparent border border-cream-400 text-ink-900 hover:bg-cream-200",
  destructive: "bg-transparent border border-danger text-danger hover:bg-danger/5",
  onDark: "bg-transparent border border-ink-600 text-cream-100 hover:bg-cream-100/10",
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
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900",
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
