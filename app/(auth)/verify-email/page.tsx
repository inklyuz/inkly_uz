"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function VerifyEmailPage() {
  const router = useRouter()
  const { state: { user, token } } = useAuth()

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Timer for resend
  const [countdown, setCountdown] = useState(60)
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
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
      if (!token) throw new Error("Avtorizatsiya xatosi, iltimos qayta kiring")
      await authApi.verifyEmail(code, token)
      // Verification successful, redirect to home
      window.location.href = "/" // hard redirect to refresh user state fully
    } catch (err: any) {
      setError(err.message || "Kod noto'g'ri yoki muddati tugagan")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || !user?.email) return
    
    setError(null)
    try {
      await authApi.resendVerification(user.email)
      setCountdown(60)
    } catch (err: any) {
      setError(err.message || "Kodni qayta yuborishda xatolik yuz berdi")
    }
  }

  return (
    <AuthShell
      title="Pochtani tasdiqlash"
      subtitle={
        user?.email 
          ? `${user.email} manziliga 6 xonali tasdiqlash kodi yuborildi.` 
          : "Pochtangizga 6 xonali tasdiqlash kodi yuborildi."
      }
    >
      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        {error && (
          <div className="rounded-lg bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        <div>
          <Input
            label="Tasdiqlash kodi"
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6)
              setCode(val)
            }}
            className="text-center text-2xl tracking-widest font-mono"
            autoFocus
          />
        </div>

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
