"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/context"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!state.loading && !state.user) {
      const next = encodeURIComponent(pathname || "/dashboard")
      router.replace(`/login?next=${next}`)
    }
  }, [pathname, router, state.loading, state.user])

  if (state.loading || !state.user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-live="polite">
        <Loader2 className="size-6 animate-spin text-primary" aria-label="Yuklanmoqda" />
      </div>
    )
  }

  return children
}
