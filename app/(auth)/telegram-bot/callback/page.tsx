"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { LoadingDots } from "@/components/ui/loading-dots"
import { CallbackCard, type CallbackStatus } from "@/components/auth/callback-card"

// ─────────────────────────────────────────────────────────────────────────────
// Telegram provider ikoni
// ─────────────────────────────────────────────────────────────────────────────

function TelegramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#29B6F6" aria-hidden="true">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Xato kodlari → foydalanuvchiga tushunarli xabar
// ─────────────────────────────────────────────────────────────────────────────

const telegramErrors: Record<string, string> = {
  TOKEN_EXPIRED: "Tasdiqlash havolasining muddati tugagan. Botga qaytib, qaytadan urinib ko'ring.",
  TOKEN_INVALID: "Tasdiqlash havolasi yaroqsiz. Botga qaytib, qaytadan urinib ko'ring.",
  VERIFICATION_NOT_FOUND: "Tasdiqlash so'rovi topilmadi. Botga qaytib, qaytadan urinib ko'ring.",
  VERIFICATION_EXPIRED: "Tasdiqlash muddati tugagan. Botga qaytib, qaytadan urinib ko'ring.",
  ALREADY_USED: "Bu havoladan allaqachon foydalanilgan. Qaytadan kirish uchun botni oching.",
}

// ─────────────────────────────────────────────────────────────────────────────
// Asosiy kontent
// ─────────────────────────────────────────────────────────────────────────────

function TelegramBotCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const [status, setStatus] = useState<CallbackStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  const token = searchParams.get("token")
  const errorParam = searchParams.get("error")

  const complete = useCallback(
    async (t: string) => {
      setStatus("loading")
      setError(null)
      try {
        const { tokens } = await authApi.telegramBotCallback(t)
        // Foydalanuvchi ma'lumotlarini olish (username uchun)
        const user = await authApi.me(tokens.access_token)
        await login(tokens)
        setStatus("success")
        // Profile sahifasiga yo'naltirish — /dashboard emas
        const redirectTo = user.username ? `/@${user.username}` : "/dashboard"
        setTimeout(() => {
          window.location.replace(redirectTo)
        }, 900)
      } catch (err: unknown) {
        const code =
          typeof err === "object" && err && "code" in err
            ? String((err as { code?: string }).code)
            : ""
        setError(
          telegramErrors[code] ??
            (err instanceof Error ? err.message : "Telegram orqali kirishda xatolik yuz berdi."),
        )
        setStatus("error")
      }
    },
    [login],
  )

  useEffect(() => {
    // Backend redirect error: /telegram-bot/callback?error=invalid_token
    if (errorParam) {
      setError(
        telegramErrors[errorParam.toUpperCase()] ??
          "Tasdiqlash havolasi yaroqsiz yoki muddati tugagan. Botga qaytib, qaytadan urinib ko'ring."
      )
      setStatus("error")
      return
    }
    if (!token) {
      setError("Havolada tasdiqlash tokeni topilmadi. Botga qaytib, havolani qayta bosing.")
      setStatus("error")
      return
    }
    complete(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, errorParam])

  async function retry() {
    if (retrying) return
    setRetrying(true)
    try {
      if (token) {
        await complete(token)
      } else {
        router.replace("/login")
      }
    } finally {
      setRetrying(false)
    }
  }

  return (
    <CallbackCard
      status={status}
      providerIcon={<TelegramIcon />}
      loadingTitle="Telegram orqali kirilmoqda…"
      loadingDescription="Iltimos, kutib turing, hisobingiz tasdiqlanmoqda."
      successTitle="Tasdiqlandi!"
      successDescription="Sizni sahifangizga yo'naltiryapmiz…"
      errorMessage={error}
      onRetry={retry}
      onBack={() => router.replace("/login")}
      retrying={retrying}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page export
// ─────────────────────────────────────────────────────────────────────────────

export default function TelegramBotCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background-muted">
          <LoadingDots size="lg" className="text-primary" />
        </div>
      }
    >
      <TelegramBotCallbackContent />
    </Suspense>
  )
}
