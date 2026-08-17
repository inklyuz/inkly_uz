"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const errorParam = searchParams.get("error")

    if (errorParam) {
      setError("Google orqali kirish bekor qilindi.")
      setTimeout(() => router.push("/login"), 3000)
      return
    }

    if (!code || !state) {
      setError("Kerakli ma'lumotlar topilmadi.")
      setTimeout(() => router.push("/login"), 3000)
      return
    }

    authApi
      .googleCallback(code, state)
      .then(async ({ tokens }) => {
        await login(tokens)
        router.push("/")
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Xatolik yuz berdi")
        setTimeout(() => router.push("/login"), 3000)
      })
  }, [searchParams, router, login])

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4 text-center">
      {error ? (
        <div className="text-[#DC2626]">
          <p className="font-semibold">{error}</p>
          <p className="mt-2 text-sm">Login sahifasiga qaytarilmoqdasiz...</p>
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
