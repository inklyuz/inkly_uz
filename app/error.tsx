"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import { LogoMark } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-100 px-6">
      {/* ── Orqa fon: yumshoq radial nur ─────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(59,117,151,0.18) 0%, rgba(111,209,215,0.08) 45%, transparent 75%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <LogoMark size={40} className="mb-8" />

        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-900/5 text-ink-900">
          <AlertTriangle size={30} strokeWidth={1.75} />
        </div>

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          Nimadir noto&apos;g&apos;ri ketdi
        </h1>
        <p className="mb-10 max-w-sm text-balance text-base leading-relaxed text-ink-700">
          Kutilmagan xatolik yuz berdi. Sahifani qayta yuklab ko&apos;ring yoki bosh sahifaga qayting.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" size="lg" onClick={() => reset()} className="w-full sm:w-auto">
            <RefreshCw size={16} />
            Qayta urinish
          </Button>
          <Link href="/">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              <Home size={16} />
              Bosh sahifaga qaytish
            </Button>
          </Link>
        </div>

        {error?.digest && (
          <p className="mt-8 text-xs text-ink-400">Xatolik kodi: {error.digest}</p>
        )}
      </div>
    </main>
  )
}
