import type { ReactNode } from "react"

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {subtitle && <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-relaxed text-text-secondary">{subtitle}</p>}
        </div>
        <div className="rounded-panel border border-border bg-background p-5 shadow-card sm:p-7">
          {children}
        </div>
      </div>
    </div>
  )
}
