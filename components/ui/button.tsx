import { Loader2 } from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "ghost" | "outline" | "destructive" | "onDark"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  children: ReactNode
}

const variants = {
  // Primary: Jet Black bg — editorial / secondary CTA
  primary: "bg-text-primary text-primary-foreground hover:bg-text-primary/90",
  accent: "bg-primary text-primary-foreground font-semibold hover:bg-inkly-hover",
  ghost: "bg-transparent border border-border text-foreground hover:bg-accent hover:border-primary hover:text-primary",
  outline: "bg-transparent border border-border text-foreground hover:bg-accent hover:border-primary hover:text-primary",
  destructive: "bg-transparent border border-destructive text-destructive hover:bg-destructive/5",
  onDark: "bg-transparent border border-white/20 text-white hover:bg-white/10",
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
        "inline-flex items-center justify-center gap-2 rounded-control font-medium",
        "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring/30",
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
