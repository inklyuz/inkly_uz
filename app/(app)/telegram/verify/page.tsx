"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ShieldCheck, ShieldAlert, RefreshCw, CheckCircle2,
  ArrowRight, Copy, AlertCircle, ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/context"
import { telegramApi } from "@/lib/api/telegram"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { LoadingDots } from "@/components/ui/loading-dots"

type VerificationStep = "idle" | "started" | "pending" | "confirmed" | "verified" | "failed"

interface VerificationData {
  verification_id: string
  token: string
  expires_at: string
  deep_link: string | null
}

const STEPS = ["Boshlash", "Kutish", "Tasdiqlash"] as const

function stepIndex(step: VerificationStep): number {
  if (step === "idle") return -1
  if (step === "started") return 0
  if (step === "pending") return 1
  if (step === "confirmed" || step === "verified") return 2
  return -1
}

export default function TelegramVerifyPage() {
  const { state } = useAuth()
  const { token, loading: authLoading } = state
  const router = useRouter()

  const [step, setStep] = useState<VerificationStep>("idle")
  const [verification, setVerification] = useState<VerificationData | null>(null)
  const [startLoading, setStartLoading] = useState(false)
  const [, setCompleteLoading] = useState(false)
  const [expired, setExpired] = useState(false)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completingRef = useRef(false) // ikki marta complete chaqirilmasin

  // Polling: started | pending | confirmed holatida ishlaydi
  useEffect(() => {
    if (!["started", "pending", "confirmed"].includes(step) || !token || !verification) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      return
    }

    const check = async () => {
      try {
        const res = await telegramApi.verificationStatus(token, verification.verification_id)

        if (res.status === "confirmed") {
          // Bot tasdiqladi — avtomatik complete chaqiramiz
          setStep("confirmed")
          if (!completingRef.current) {
            completingRef.current = true
            clearInterval(pollRef.current!)
            pollRef.current = null
            await handleComplete()
          }
        } else if (res.status === "verified") {
          clearInterval(pollRef.current!); pollRef.current = null
          setStep("verified")
          toast.success("Telegram ulandi!")
          setTimeout(() => router.push("/telegram/account"), 1500)
        } else if (res.status === "expired") {
          clearInterval(pollRef.current!); pollRef.current = null
          setExpired(true); setStep("failed")
        } else if (res.status === "failed") {
          clearInterval(pollRef.current!); pollRef.current = null
          setStep("failed")
        } else {
          // pending — foydalanuvchi botga hali bormagan
          setStep((prev) => (prev === "started" ? "pending" : prev))
        }
      } catch (err) {
        console.error("Status check failed:", err)
      }
    }

    check()
    pollRef.current = setInterval(check, 5000)
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, token, verification?.verification_id])

  const handleStart = async () => {
    if (!token) return
    setStartLoading(true)
    setExpired(false)
    completingRef.current = false
    try {
      const data = await telegramApi.startVerification(token)
      setVerification(data)
      setStep("started")
      toast.success("Tasdiqlash boshlandi — Telegram botga o'ting.")
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string }
      if (error.code === "TELEGRAM_ACCOUNT_ALREADY_CONNECTED") {
        toast.info("Siz allaqachon tasdiqlangansiz")
        setStep("verified")
      } else {
        toast.error(error.message ?? "Tasdiqlashni boshlashda xatolik")
      }
    } finally {
      setStartLoading(false)
    }
  }

  // Bot tasdiqladi → complete endpoint chaqiramiz
  const handleComplete = async () => {
    if (!token || !verification) return
    setCompleteLoading(true)
    try {
      await telegramApi.completeVerification(token, {
        verification_id: verification.verification_id,
        token: verification.token,
      })
      setStep("verified")
      toast.success("Telegram muvaffaqiyatli ulandi!")
      setTimeout(() => router.push("/telegram/account"), 1500)
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string }
      if (error.code === "TELEGRAM_VERIFICATION_EXPIRED") {
        setExpired(true); setStep("failed")
      } else {
        toast.error(error.message ?? "Tasdiqlashda xatolik")
        setStep("failed")
      }
    } finally {
      setCompleteLoading(false)
    }
  }

  const copyToken = () => {
    if (verification) { navigator.clipboard.writeText(verification.token); toast.success("Token nusxalandi") }
  }

  const handleReset = () => {
    setStep("idle"); setVerification(null); setExpired(false); completingRef.current = false
  }

  if (authLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingDots size="lg" className="text-primary" /></div>
  }

  const currentStepIdx = stepIndex(step)
  // Deep link: start_verification javobi ichidan, tokenli
  const botLink = verification?.deep_link ?? null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Telegram ulash</h1>
        <p className="text-sm text-text-muted mt-1">Telegram bot orqali hisobingizni Inkly bilan bog'lang.</p>
      </div>

      {step !== "failed" && (
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((label, idx) => {
            const done = currentStepIdx > idx
            const active = currentStepIdx === idx
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300",
                    done ? "bg-green-500 text-white" : active ? "bg-primary text-white" : "bg-border-default text-text-muted",
                  )}>
                    {done ? <CheckCircle2 size={15} /> : idx + 1}
                  </div>
                  <span className={cn("text-xs font-medium", done ? "text-green-600" : active ? "text-primary" : "text-text-muted")}>
                    {label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <ArrowRight size={14} className={cn("mb-4 transition-colors", done ? "text-green-500" : "text-border-default")} />
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="rounded-2xl border border-border-default bg-white">

        {/* IDLE */}
        {step === "idle" && (
          <div className="text-center py-12 px-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-inkly-orange-light flex items-center justify-center mb-4">
              <ShieldCheck size={28} className="text-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Telegram ulashni boshlang</h3>
            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
              Telegram botga o'ting va bir martalik kodni tasdiqlang — hisob avtomatik bog'lanadi.
            </p>
            <Button onClick={handleStart} disabled={startLoading}
              className="rounded-full bg-primary px-8 font-semibold text-white hover:bg-inkly-hover">
              {startLoading ? (
                <><LoadingDots size="md" className="mr-2" />Boshlanmoqda...</>
              ) : (
                <><ShieldCheck size={15} className="mr-2" />Boshlash</>
              )}
            </Button>
          </div>
        )}

        {/* STARTED — botga o'tish havolasi (tokenli deep link) */}
        {step === "started" && (
          <div className="text-center py-12 px-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <RefreshCw size={28} className="text-blue-500 animate-spin" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Botga o'ting</h3>
            <p className="text-sm text-text-muted mb-5 max-w-sm mx-auto">
              Quyidagi havolani bosing — bot tokenni avtomatik qabul qiladi.
              Yoki tokenni qo'lda nusxalab, botga yuboring.
            </p>

            {verification && (
              <div className="bg-bg-muted rounded-xl p-4 max-w-xs mx-auto mb-5 text-left">
                <p className="text-xs text-text-muted mb-1.5">Tasdiqlash tokeni</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-white px-2.5 py-1.5 rounded-lg flex-1 truncate border border-border-default">
                    {verification.token}
                  </code>
                  <Button variant="ghost" size="icon" onClick={copyToken}
                    className="shrink-0 h-8 w-8 text-text-muted hover:text-text-primary" title="Nusxalash">
                    <Copy size={13} />
                  </Button>
                </div>
              </div>
            )}

            {botLink ? (
              <a href={botLink} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-inkly-hover transition-colors">
                Telegram botga o'tish <ExternalLink size={13} />
              </a>
            ) : (
              <p className="text-xs text-text-muted">
                Botga o'ting va yuqoridagi tokenni yuboring
              </p>
            )}
          </div>
        )}

        {/* PENDING — foydalanuvchi botga bordi, tasdiq kutilmoqda */}
        {step === "pending" && (
          <div className="text-center py-12 px-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <RefreshCw size={28} className="text-amber-500 animate-spin" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Bot tasdiqini kutmoqda…</h3>
            <p className="text-sm text-text-muted mb-5 max-w-sm mx-auto">
              Telegram botga tokenni yubording — bot tasdiqlashi bilanoq avtomatik davom etiladi.
            </p>
            {botLink && (
              <a href={botLink} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border-default px-5 py-2 text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors">
                Botga qaytish <ExternalLink size={13} />
              </a>
            )}
          </div>
        )}

        {/* CONFIRMED — bot tasdiqladi, complete chaqirilmoqda */}
        {step === "confirmed" && (
          <div className="text-center py-12 px-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <RefreshCw size={28} className="text-blue-500 animate-spin" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Yakunlanmoqda…</h3>
            <p className="text-sm text-text-muted">Bot tasdiqladi — hisob bog'lanmoqda.</p>
          </div>
        )}

        {/* VERIFIED */}
        {step === "verified" && (
          <div className="text-center py-12 px-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Muvaffaqiyatli ulandi!</h3>
            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
              Telegram hisobingiz Inkly bilan bog'landi.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button onClick={() => router.push("/telegram/account")}
                className="rounded-full bg-primary px-6 font-semibold text-white hover:bg-inkly-hover">
                Akkauntga o'tish
              </Button>
              <Button variant="ghost" onClick={() => router.push("/telegram/channels")}
                className="rounded-full text-text-secondary hover:bg-bg-muted">
                Kanallar
              </Button>
            </div>
          </div>
        )}

        {/* FAILED */}
        {step === "failed" && (
          <div className="text-center py-12 px-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <ShieldAlert size={28} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">
              {expired ? "Muddat tugadi" : "Tasdiqlash amalga oshmadi"}
            </h3>
            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
              {expired ? "Tasdiqlash vaqti tugab ketdi." : "Xatolik yuz berdi."} Qaytadan urinib ko'ring.
            </p>
            {expired && (
              <p className="text-sm text-amber-600 mb-4 flex items-center justify-center gap-1.5">
                <AlertCircle size={13} /> Token 10 daqiqa amal qiladi.
              </p>
            )}
            <Button onClick={handleReset}
              className="rounded-full bg-primary px-6 font-semibold text-white hover:bg-inkly-hover">
              <RefreshCw size={15} className="mr-2" /> Qaytadan boshlash
            </Button>
          </div>
        )}
      </div>

      {step === "idle" && (
        <div className="rounded-2xl bg-inkly-orange-light border border-inkly-peach p-5">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" /> Qanday ishlaydi?
          </h3>
          <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
            <li>"Boshlash" tugmasini bosing</li>
            <li>Telegram botga o'ting (havola avtomatik chiqadi)</li>
            <li>Bot tokenni qabul qilib, hisobingizni tasdiqlaydi</li>
            <li>Sahifa avtomatik yangilanadi</li>
          </ol>
        </div>
      )}
    </div>
  )
}