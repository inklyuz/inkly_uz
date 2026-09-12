"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CheckCircle2, Unlink2, ShieldCheck, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/context"
import { telegramApi } from "@/lib/api/telegram"
import type { TelegramAccountResponse } from "@/lib/api/telegram"
import { toast } from "sonner"
import { LoadingDots } from "@/components/ui/loading-dots"

// Telegram logotipi — to'g'ri SVG
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

export default function TelegramAccountPage() {
  const { state } = useAuth()
  const { token, loading: authLoading } = state
  const router = useRouter()

  const [account, setAccount] = useState<TelegramAccountResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlinking, setUnlinking] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    telegramApi
      .getAccount(token)
      .then(setAccount)
      .catch((err: unknown) => {
        const code =
          typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : ""
        if (code === "TELEGRAM_NOT_CONNECTED" || code === "NOT_FOUND") {
          setAccount(null)
          return
        }
        console.error("Failed to load telegram account:", err)
        toast.error("Telegram akkaunt ma'lumotlari yuklanmadi")
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleUnlink = async () => {
    if (!token) return
    const ok = window.confirm(
      "Telegram akkauntini uzishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.",
    )
    if (!ok) return

    setUnlinking(true)
    try {
      await telegramApi.unlinkAccount(token)
      toast.success("Telegram akkaunti uzildi")
      setAccount(null)
    } catch (err) {
      console.error("Unlink failed:", err)
      toast.error("Akkauntni uzishda xatolik yuz berdi")
    } finally {
      setUnlinking(false)
    }
  }

  // ✅ TUZATILDI: to'g'ri route
  const handleManageChannels = () => router.push("/telegram/channels")
  const handleStartVerification = () => router.push("/telegram/verify")

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingDots size="lg" className="text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Telegram akkaunti</h1>
        <p className="text-sm text-text-muted mt-1">
          Akkauntingizni bog'lang, kanallarni boshqaring va maqolalarni avtomatik yuboring.
        </p>
      </div>

      {/* Status Card */}
      <div className="rounded-2xl border border-border-default bg-white p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingDots size="lg" className="text-primary" />
          </div>
        ) : account ? (
          /* ── Bog'langan holati ─────────────────────────────────────── */
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar: photo_url bor bo'lsa img, yo'q bo'lsa placeholder */}
              <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-inkly-orange-light flex items-center justify-center">
                {account.photo_url ? (
                  <Image
                    src={account.photo_url}
                    alt={account.first_name ?? "Avatar"}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <TelegramIcon className="h-7 w-7 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-text-primary">
                    {account.first_name ?? ""} {account.last_name ?? ""}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircle2 size={10} />
                    Bog'langan
                  </span>
                </div>
                <p className="text-sm text-text-muted mt-0.5">
                  @{account.telegram_username ?? "username yo'q"}
                </p>
                <p className="text-xs text-text-muted mt-0.5 font-mono">
                  ID: {account.telegram_user_id}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Bog'lanmagan holati ───────────────────────────────────── */
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-inkly-orange-light flex items-center justify-center mb-4">
              <TelegramIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-text-primary">Telegram akkaunti bog'lanmagan</h3>
            <p className="text-sm text-text-muted mt-1 max-w-sm mx-auto">
              Tasdiqlash orqali akkauntingizni bog'lang va kanallar orqali maqolalarni avtomatik yuboring.
            </p>
            <Button
              onClick={handleStartVerification}
              className="mt-5 rounded-full bg-primary px-6 py-2 font-semibold text-white hover:bg-inkly-hover"
            >
              <ShieldCheck size={15} className="mr-2" />
              Tasdiqlashni boshlash
            </Button>
          </div>
        )}
      </div>

      {account && (
        <>
          {/* Amallar */}
          <div className="rounded-2xl border border-border-default bg-white p-6">
            <h3 className="font-semibold text-text-primary mb-4">Amallar</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleManageChannels}
                className="flex-1 gap-2 rounded-full border-border-default text-text-secondary hover:border-primary hover:text-primary"
              >
                <Send size={15} />
                Kanallarni boshqarish
              </Button>
              <Button
                variant="outline"
                onClick={handleStartVerification}
                className="flex-1 gap-2 rounded-full border-border-default text-text-secondary hover:border-primary hover:text-primary"
              >
                <ShieldCheck size={15} />
                Tasdiqlash
              </Button>
              <Button
                variant="ghost"
                onClick={handleUnlink}
                disabled={unlinking}
                className="flex-1 gap-2 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                {unlinking ? (
                  <>
                    <LoadingDots size="md" />
                    Uzilmoqda...
                  </>
                ) : (
                  <>
                    <Unlink2 size={15} />
                    Akkauntni uzish
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Ma'lumot */}
          <div className="rounded-2xl border border-border-default bg-white p-6">
            <h3 className="font-semibold text-text-primary mb-4">Ma'lumot</h3>
            <dl className="space-y-3 text-sm divide-y divide-border-default">
              <div className="flex justify-between pt-0">
                <dt className="text-text-muted">Bog'langan sana</dt>
                <dd className="font-medium text-text-primary">
                  {new Date(account.created_at).toLocaleDateString("uz-UZ")}
                </dd>
              </div>
              <div className="flex justify-between pt-3">
                <dt className="text-text-muted">Telegram ID</dt>
                <dd className="font-medium text-text-primary font-mono">{account.telegram_user_id}</dd>
              </div>
              <div className="flex justify-between pt-3">
                <dt className="text-text-muted">Username</dt>
                <dd className="font-medium text-text-primary">
                  @{account.telegram_username ?? "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Imkoniyatlar */}
          <div className="rounded-2xl bg-inkly-orange-light border border-inkly-peach p-5">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              Nimalar qilishingiz mumkin?
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              {[
                "Maqolalarni Telegram kanallariga avtomatik yuborish",
                "Bir nechta kanal qo'shish va ularni boshqarish",
                "Kanal tasdiqlash va tekshiruv o'tkazish",
                "Yuborilgan maqolalar tarixi va holatini kuzatish",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}