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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-14">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#141414]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-[#36565F]">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}
