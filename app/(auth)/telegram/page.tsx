"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TelegramPage() {
  const router = useRouter()
  const { login } = useAuth()
  
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [verificationId, setVerificationId] = useState("")
  const [tokenCode, setTokenCode] = useState("")

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.telegramStart()
      setVerificationId(res.verification_id)
      setTokenCode(res.token)
      setStep(2)
    } catch (err: any) {
      setError(err.message || "Telegram tizimi bilan ulanishda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    setError(null)
    try {
      // Dastlab tasdiqlash tugmasini bosganda backend tekshiradi.
      // Eslatma: Inkly Bot'ga token kodini kiritib bo'lgandan SO'NG bu tugma bosilishi kerak.
      const res = await authApi.telegramVerify({
        verification_id: verificationId,
        token: tokenCode,
      })
      await login(res.tokens || res)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Tasdiqlanmadi. Telegram botga kodni yuborganingizga ishonch hosil qiling.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Telegram orqali kirish"
      subtitle="Inkly Telegram boti orqali tezkor autentifikatsiya."
    >
      <div className="flex flex-col gap-6">
        {error && (
          <div className="rounded-lg bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="text-center">
            <p className="mb-6 text-sm text-[#36565F]">
              Kirish uchun quyidagi tugmani bosing va Telegram bot orqali tasdiqlang.
            </p>
            <Button variant="accent" className="w-full" onClick={handleStart} loading={loading}>
              Boshlash
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 rounded-xl border border-[#E8E3DD] bg-[#F2F4F7] p-6 w-full">
              <p className="text-sm text-[#6B7280]">Sizning maxsus kodingiz:</p>
              <h2 className="mt-2 text-4xl font-mono font-bold tracking-widest text-[#141414]">
                {tokenCode}
              </h2>
            </div>
            
            <ol className="mb-8 flex flex-col gap-4 text-left text-sm text-[#36565F]">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/10 text-xs font-bold text-[#FF6A00]">1</span>
                <span>Telegram'ga kiring va <a href="https://t.me/inkly_uz_bot" target="_blank" rel="noreferrer" className="font-semibold text-[#FF6A00] hover:underline">@inkly_uz_bot</a> ni toping.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/10 text-xs font-bold text-[#FF6A00]">2</span>
                <span>Yuqoridagi kodni botga yozib yuboring.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/10 text-xs font-bold text-[#FF6A00]">3</span>
                <span>Bot qabul qilgach, pastdagi tasdiqlash tugmasini bosing.</span>
              </li>
            </ol>

            <Button variant="accent" className="w-full" onClick={handleVerify} loading={loading}>
              Tasdiqladim, tizimga kirish
            </Button>
          </div>
        )}
      </div>
    </AuthShell>
  )
}
