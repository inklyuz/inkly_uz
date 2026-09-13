"use client"

import { useEffect } from "react"

/**
 * Telegram browser callback is handled by the backend.
 * Kept only as a defensive fallback for old callback links.
 */
export default function TelegramBotCallbackPage() {
  useEffect(() => {
    window.location.replace("/dashboard")
  }, [])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background-muted">
      <p className="text-sm text-text-muted">Telegram orqali kirish yakunlanmoqda…</p>
    </div>
  )
}
