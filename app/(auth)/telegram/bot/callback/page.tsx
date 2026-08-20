"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"

const authErrorMessages: Record<string, string> = {
  AUTH_TRANSACTION_NOT_FOUND: "Telegram orqali kirish havolasi topilmadi.",
  AUTH_TRANSACTION_EXPIRED: "Telegram orqali kirish havolasining muddati tugagan.",
  AUTH_TOKEN_EXPIRED: "Telegram orqali kirish havolasining muddati tugagan.",
  AUTH_TOKEN_ALREADY_USED: "Bu kirish havolasi allaqachon ishlatilgan.",
  TELEGRAM_AUTH_INVALID: "Telegram orqali tasdiqlash amalga oshmadi.",
  SESSION_EXPIRED: "Sessiyani tiklab bo'lmadi. Qaytadan urinib ko'ring.",
}

function TelegramBotCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, refresh } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get("token")
    const status = searchParams.get("status")

    if (status === "success" && !token) {
      refresh()
        .then(() => router.replace("/dashboard"))
        .catch(() => setError(authErrorMessages.SESSION_EXPIRED))
      return
    }

    if (!token) {
      setError("Telegram orqali kirish havolasi noto'g'ri.")
      return
    }

    authApi
      .telegramBotCallback(token)
      .then(async ({ tokens }) => {
        await login(tokens)
        router.replace("/dashboard")
      })
      .catch((err: unknown) => {
        const code = typeof err === "object" && err && "code" in err ? String(err.code) : ""
        setError(authErrorMessages[code] ?? (err instanceof Error ? err.message : "Xatolik yuz berdi"))
      })
  }, [searchParams, router, login, refresh])

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4 text-center">
      {error ? (
        <div className="text-destructive">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-4 rounded-control bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Qayta urinish
          </button>
        </div>
      ) : (
        <div className="text-text-secondary">
          <p className="text-lg font-medium">Telegram orqali kiritilmoqda...</p>
          <p className="mt-2 text-sm text-text-muted">Iltimos, kutib turing.</p>
        </div>
      )}
    </div>
  )
}

export default function TelegramBotCallbackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Yuklanmoqda...</div>}>
      <TelegramBotCallbackContent />
    </Suspense>
  )
}
