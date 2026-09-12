"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { LoadingDots } from "@/components/ui/loading-dots"
import { CallbackCard, type CallbackStatus } from "@/components/auth/callback-card"

// ─────────────────────────────────────────────────────────────────────────────
// Google provider ikoni
// ─────────────────────────────────────────────────────────────────────────────

function GoogleColorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Xato kodlari → foydalanuvchiga tushunarli xabar
// ─────────────────────────────────────────────────────────────────────────────

const googleErrors: Record<string, string> = {
  OAUTH_STATE_MISMATCH: "Google orqali kirishda sessiya muammosi yuz berdi. Qaytadan urinib ko'ring.",
  OAUTH_STATE_EXPIRED: "Google login sessiyasi muddati tugagan. Qaytadan urinib ko'ring.",
  GOOGLE_AUTH_FAILED: "Google orqali kirish amalga oshmadi. Qaytadan urinib ko'ring.",
  OAUTH_PROVIDER_ERROR: "Google orqali kirish amalga oshmadi. Qaytadan urinib ko'ring.",
  GOOGLE_AUTH_CANCELLED: "Google orqali kirish bekor qilindi.",
}

// ─────────────────────────────────────────────────────────────────────────────
// Asosiy kontent
// ─────────────────────────────────────────────────────────────────────────────

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, refresh } = useAuth()

  const [status, setStatus] = useState<CallbackStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const errorParam = searchParams.get("error")
    const successStatus = searchParams.get("status")

    // Google xato parametri yuborsa
    if (errorParam) {
      setError(googleErrors[errorParam] ?? "Google orqali kirishda xatolik yuz berdi.")
      setStatus("error")
      return
    }

    // Backend allaqachon token o'rnatgan (status=success, code yo'q)
    if (successStatus === "success" && !code && !state) {
      refresh()
        .then(() => {
          setStatus("success")
          setTimeout(() => {
            window.location.replace("/dashboard")
          }, 900)
        })
        .catch(() => {
          setError("Sessiyani tiklab bo'lmadi. Qaytadan urinib ko'ring.")
          setStatus("error")
        })
      return
    }

    // Standart OAuth: code + state bilan callback
    if (!code || !state) {
      setError("Google callback ma'lumotlari topilmadi. Qaytadan urinib ko'ring.")
      setStatus("error")
      return
    }

    authApi
      .googleCallback(code, state)
      .then(async ({ tokens }) => {
        await login(tokens)
        setStatus("success")
        setTimeout(() => {
          window.location.replace("/dashboard")
        }, 900)
      })
      .catch((err: unknown) => {
        const errCode =
          typeof err === "object" && err && "code" in err
            ? String((err as { code: unknown }).code)
            : ""
        setError(
          googleErrors[errCode] ??
            (err instanceof Error ? err.message : "Xatolik yuz berdi"),
        )
        setStatus("error")
      })
  // searchParams o'zgarmaydi — bir marta ishga tushishi yetarli
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function retry() {
    if (retrying) return
    setRetrying(true)
    setError(null)
    try {
      const url = await authApi.getGoogleUrl()
      window.location.assign(url)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google orqali kirishda xatolik yuz berdi",
      )
      setStatus("error")
      setRetrying(false)
    }
  }

  return (
    <CallbackCard
      status={status}
      providerIcon={<GoogleColorIcon />}
      loadingTitle="Google orqali kiritilmoqda…"
      loadingDescription="Iltimos, kutib turing, hisobingiz tasdiqlanmoqda."
      successTitle="Tasdiqlandi!"
      successDescription="Sizni boshqaruv paneliga yo'naltiryapmiz…"
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

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background-muted">
          <LoadingDots size="lg" className="text-primary" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  )
}