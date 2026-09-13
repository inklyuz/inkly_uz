"use client"

import { useEffect } from "react"

/**
 * Google OAuth callback is handled by the backend.
 * This route is kept only as a defensive fallback for stale OAuth clients.
 */
export default function GoogleCallbackPage() {
  useEffect(() => {
    window.location.replace("/dashboard")
  }, [])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background-muted">
      <p className="text-sm text-text-muted">Google orqali kirish yakunlanmoqda…</p>
    </div>
  )
}
