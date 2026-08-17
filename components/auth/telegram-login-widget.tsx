"use client"

import { useEffect, useRef, useState } from "react"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export function TelegramLoginWidget({ onSuccess }: { onSuccess: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const callbackName = `onTelegramAuth_${Math.random().toString(36).slice(2)}`
    const handleAuth = async (userData: TelegramAuthData) => {
      setError(null)
      setLoading(true)
      try {
        const { tokens } = await authApi.telegramLogin({
          id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name ?? null,
          username: userData.username ?? null,
          photo_url: userData.photo_url ?? null,
          auth_date: userData.auth_date,
          hash: userData.hash,
        })
        await login(tokens)
        onSuccess()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Telegram orqali kirishda xatolik yuz berdi")
      } finally {
        setLoading(false)
      }
    }

    const telegramWindow = window as unknown as Record<string, (user: TelegramAuthData) => void>
    telegramWindow[callbackName] = handleAuth
    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-widget.js?22"
    script.async = true
    script.setAttribute("data-telegram-login", "inkly_uz_bot")
    script.setAttribute("data-size", "large")
    script.setAttribute("data-radius", "10")
    script.setAttribute("data-onauth", `${callbackName}(user)`)
    script.setAttribute("data-request-access", "write")
    containerRef.current?.appendChild(script)

    return () => {
      script.remove()
      delete telegramWindow[callbackName]
    }
  }, [login, onSuccess])

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={containerRef} aria-busy={loading} className="flex min-h-11 justify-center" />
      {loading && <p className="text-sm text-text-muted">Tekshirilmoqda...</p>}
      {error && <p role="alert" className="max-w-sm text-center text-sm text-destructive">{error}</p>}
    </div>
  )
}
