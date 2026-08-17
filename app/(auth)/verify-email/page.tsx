"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  // Email register sahifasidan URL orqali keladi
  const email = searchParams.get("email") ?? ""

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    if (!email) {
      router.replace("/register")
    }
  }, [email, router])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError("Iltimos, 6 xonali kodni to'liq kiriting")
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Qadam 2: OTP tasdiqlash → token qaytaradi
      const { tokens } = await authApi.confirmRegistration({ email, code })
      await login(tokens)
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kod noto'g'ri yoki muddati tugagan")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || !email) return
    setError(null)
    try {
      await authApi.resendVerification(email)
      setCountdown(60)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kodni qayta yuborishda xatolik yuz berdi")
    }
  }

  return (
    <AuthShell
      title="Pochtani tasdiqlash"
      subtitle={
        email
          ? `${email} manziliga 6 xonali tasdiqlash kodi yuborildi.`
          : "Pochtangizga 6 xonali tasdiqlash kodi yuborildi."
      }
    >
      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        {error && (
          <div className="rounded-lg bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        <Input
          label="Tasdiqlash kodi"
          type="text"
          inputMode="numeric"
          placeholder="123456"
          value={code}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6)
            setCode(val)
          }}
          className="text-center text-2xl tracking-widest font-mono"
          autoFocus
        />

        <Button type="submit" variant="accent" loading={loading} className="w-full">
          Tasdiqlash
        </Button>

        <div className="text-center mt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0}
            className={`text-sm font-medium ${
              countdown > 0
                ? "text-[#6B7280] cursor-not-allowed"
                : "text-[#FF6A00] hover:underline cursor-pointer"
            }`}
          >
            {countdown > 0
              ? `Kodni qayta yuborish (${countdown}s)`
              : "Kodni qayta yuborish"}
          </button>
        </div>
      </form>
    </AuthShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yuklanmoqda...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
