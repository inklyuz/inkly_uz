"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"

const authErrorMessages: Record<string, string> = {
  OAUTH_STATE_MISMATCH: "Google orqali kirishda sessiya muammosi yuz berdi. Qaytadan urinib ko'ring.",
  OAUTH_STATE_EXPIRED: "Google login sessiyasi muddati tugagan. Qaytadan urinib ko'ring.",
  GOOGLE_AUTH_FAILED: "Google orqali kirish amalga oshmadi. Qaytadan urinib ko'ring.",
  OAUTH_PROVIDER_ERROR: "Google orqali kirish amalga oshmadi. Qaytadan urinib ko'ring.",
  GOOGLE_AUTH_CANCELLED: "Google orqali kirish bekor qilindi.",
}

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, refresh } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const errorParam = searchParams.get("error")
    const status = searchParams.get("status")

    if (errorParam) {
      setError(authErrorMessages[errorParam] ?? "Google orqali kirishda xatolik yuz berdi.")
      return
    }

    if (status === "success" && !code && !state) {
      refresh()
        .then(() => router.replace("/dashboard"))
        .catch(() => setError("Sessiyani tiklab bo'lmadi. Qaytadan urinib ko'ring."))
      return
    }

    if (!code || !state) {
      setError("Google callback ma'lumotlari topilmadi. Qaytadan urinib ko'ring.")
      return
    }

    authApi
      .googleCallback(code, state)
      .then(async ({ tokens }) => {
        await login(tokens)
        router.replace("/dashboard")
      })
      .catch((err: unknown) => {
        const code = typeof err === "object" && err && "code" in err ? String(err.code) : ""
        setError(authErrorMessages[code] ?? (err instanceof Error ? err.message : "Xatolik yuz berdi"))
      })
  }, [searchParams, router, login, refresh])

  async function retryGoogle() {
    if (retrying) return
    setRetrying(true)
    setError(null)
    try {
      const response = await authApi.getGoogleUrl()
      window.location.assign(response.authorization_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google orqali kirishda xatolik yuz berdi")
      setRetrying(false)
    }
  }

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4 text-center">
      {error ? (
        <div className="text-[#DC2626]">
          <p className="font-semibold">{error}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={retryGoogle}
              disabled={retrying}
              className="rounded-control bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {retrying ? "Ulanmoqda..." : "Qayta urinish"}
            </button>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="rounded-control border border-border px-4 py-2 text-sm font-medium text-foreground"
            >
              Login sahifasi
            </button>
          </div>
        </div>
      ) : (
        <div className="text-[#36565F]">
          <p className="text-lg font-medium">Google orqali kiritilmoqda...</p>
          <p className="mt-2 text-sm text-[#6B7280]">Iltimos, kutib turing.</p>
        </div>
      )}
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[#6B7280]">Yuklanmoqda...</div>}>
      <GoogleCallbackContent />
    </Suspense>
  )
}
