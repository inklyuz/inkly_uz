import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

// Shared card surface — consolidates the rounded-lg/xl/2xl + border + bg-white
// patterns that were previously hand-rolled per page (dashboard stat cards,
// telegram list panels, settings sections, etc). Uses the existing
// --radius-card / --shadow-card tokens from globals.css.

const cardVariants = {
  /** Standard bordered surface — the default for panels, list containers, stat cards. */
  default: "rounded-card border border-border bg-card shadow-card",
  /** Slightly larger radius for prominent standalone panels (modals, settings sections). */
  panel: "rounded-panel border border-border bg-card shadow-card",
  /** No border/shadow — for cards nested inside another card or a muted section. */
  flat: "rounded-card bg-muted",
} as const

export type CardVariant = keyof typeof cardVariants

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  /** Adds hover elevation — use for clickable/interactive cards. */
  interactive?: boolean
}

export function Card({ variant = "default", interactive, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        cardVariants[variant],
        interactive && "transition-shadow duration-150 hover:shadow-card-hover",
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 border-b border-border px-5 py-4", className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-foreground", className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-text-muted", className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-2 border-t border-border px-5 py-4", className)} {...props} />
  )
}
