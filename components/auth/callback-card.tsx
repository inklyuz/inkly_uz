"use client"

/**
 * CallbackCard — Telegram va Google callback sahifalarida
 * bir xil dizayn va animatsiyani ta'minlovchi umumiy komponent.
 *
 * Ishlatish:
 *   <CallbackCard status="loading" providerIcon={<TelegramIcon />} title="Telegram orqali kirilmoqda…" />
 *   <CallbackCard status="success" ... />
 *   <CallbackCard status="error" errorMessage="..." onRetry={fn} onBack={fn} retrying={false} />
 */

import Link from "next/link"
import { CheckCircle2, XCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { LoadingDots } from "@/components/ui/loading-dots"
import { LogoMark } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"

export type CallbackStatus = "loading" | "success" | "error"

interface CallbackCardProps {
  status: CallbackStatus
  /** Provider ikonkasi (Telegram SVG yoki Google SVG) */
  providerIcon: React.ReactNode
  /** Loading holatidagi sarlavha */
  loadingTitle: string
  /** Loading holatidagi tavsif */
  loadingDescription?: string
  /** Muvaffaqiyat sarlavhasi */
  successTitle?: string
  /** Muvaffaqiyat tavsifi */
  successDescription?: string
  /** Xato matni */
  errorMessage?: string | null
  /** Qayta urinish tugmasi bosilganda */
  onRetry?: () => void
  /** Ortga tugmasi bosilganda */
  onBack?: () => void
  /** Qayta urinish jarayonida */
  retrying?: boolean
}

export function CallbackCard({
  status,
  providerIcon,
  loadingTitle,
  loadingDescription = "Iltimos, kutib turing, hisobingiz tasdiqlanmoqda.",
  successTitle = "Tasdiqlandi!",
  successDescription = "Sizni boshqaruv paneliga yo'naltiryapmiz…",
  errorMessage,
  onRetry,
  onBack,
  retrying = false,
}: CallbackCardProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background-muted px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 inline-flex items-center gap-1.5">
        <LogoMark size={26} />
        <span className="text-xl font-bold tracking-tighter text-text-primary">inkly</span>
      </Link>

      {/* Karta */}
      <div className="w-full max-w-sm rounded-panel border border-border-default bg-white p-8 shadow-card text-center">

        {/* ── LOADING ── */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-5">
            {/* Aylanuvchan halqa ichida provider ikoni */}
            <SpinnerRing>{providerIcon}</SpinnerRing>

            <div>
              <h1 className="text-base font-semibold text-text-primary">{loadingTitle}</h1>
              <p className="mt-1.5 text-sm text-text-muted">{loadingDescription}</p>
            </div>

            <LoadingDots size="lg" className="text-primary" />
          </div>
        )}

        {/* ── SUCCESS ── */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-5">
            {/* Yashil tekshirish belgisi */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 ring-4 ring-green-50/60">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>

            <div>
              <h1 className="text-base font-semibold text-text-primary">{successTitle}</h1>
              <p className="mt-1.5 text-sm text-text-muted">{successDescription}</p>
            </div>

            <LoadingDots size="md" className="text-primary" />
          </div>
        )}

        {/* ── ERROR ── */}
        {status === "error" && (
          <div className="flex flex-col items-center gap-5">
            {/* Qizil xato belgisi */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-50/60">
              <XCircle size={28} className="text-red-500" />
            </div>

            <div>
              <h1 className="text-base font-semibold text-text-primary">Kirish amalga oshmadi</h1>
              <p className="mt-1.5 text-sm text-text-muted leading-relaxed">
                {errorMessage ?? "Noma'lum xatolik yuz berdi."}
              </p>
            </div>

            {/* Tugmalar */}
            <div className="flex w-full flex-col gap-2.5">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  disabled={retrying}
                  loading={retrying}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  {!retrying && <RefreshCw size={15} />}
                  Qayta urinish
                </Button>
              )}
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="md"
                  className="w-full"
                >
                  <ArrowLeft size={15} />
                  Login sahifasi
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SpinnerRing — aylanuvchan Inkly-rang halqa ichida provider ikoni
// ─────────────────────────────────────────────────────────────────────────────

function SpinnerRing({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      {/* Tashqi aylanuvchan halqa */}
      <svg
        aria-hidden
        className="absolute inset-0 animate-spin"
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
      >
        {/* Fon halqa */}
        <circle cx="32" cy="32" r="28" stroke="var(--color-inkly-orange)" strokeOpacity="0.15" strokeWidth="3" />
        {/* Faol yoy */}
        <path
          d="M32 4 A28 28 0 0 1 60 32"
          stroke="var(--color-inkly-orange)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Ichki provider ikoni */}
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border-default">
        {children}
      </div>
    </div>
  )
}