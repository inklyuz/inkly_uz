"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { AuthShell } from "@/components/auth/auth-shell"

// Telegram Login Widget qo'llab-quvvatlash uchun global type
declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthData) => void
  }
}

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export default function TelegramPage() {
  const router = useRouter()
  const { login } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Callback — Telegram Widget chaqiradi
    window.onTelegramAuth = async (userData: TelegramAuthData) => {
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
        router.push("/")
      } catch (err: unknown) {
        console.error("Telegram login failed:", err)
        // Widget o'zi xato ko'rsatmaydi — sahifani yangilab retry
        router.push("/login?error=telegram")
      }
    }

    // Telegram Widget scriptini dinamik qo'shamiz
    const script = document.createElement("script")
    script.src = "https://telegram.org/js/telegram-widget.js?22"
    script.setAttribute("data-telegram-login", "inkly_uz_bot") // bot username
    script.setAttribute("data-size", "large")
    script.setAttribute("data-radius", "12")
    script.setAttribute("data-onauth", "onTelegramAuth(user)")
    script.setAttribute("data-request-access", "write")
    script.async = true

    if (containerRef.current) {
      containerRef.current.appendChild(script)
    }

    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script)
      }
      delete window.onTelegramAuth
    }
  }, [login, router])

  return (
    <AuthShell
      title="Telegram orqali kirish"
      subtitle="Telegram akkauntingiz bilan bir marta bosishda kiring."
    >
      <div className="flex flex-col items-center gap-8 py-4">
        <p className="text-sm text-[#36565F] text-center">
          Quyidagi tugmani bosing va Telegram akkauntingizni tasdiqlang.
        </p>

        {/* Telegram Widget shu yerga o'rnatiladi */}
        <div ref={containerRef} className="flex justify-center" />

        <p className="text-xs text-[#6B7280] text-center">
          Telegram tomonidan xavfsiz autentifikatsiya. Parol talab qilinmaydi.
        </p>
      </div>
    </AuthShell>
  )
}
