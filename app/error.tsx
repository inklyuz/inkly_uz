"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home } from "lucide-react"
import { LogoMark } from "@/components/ui/logo"
import { ErrorState } from "@/components/ui/route-states"

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
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 sm:px-6">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <LogoMark size={40} className="mb-8" />
        <div className="mb-6 flex size-16 items-center justify-center rounded-panel bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="mb-3 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Nimadir noto&apos;g&apos;ri ketdi</h1>
        <p className="mb-8 max-w-sm text-pretty text-base leading-relaxed text-text-secondary">Kutilmagan xatolik yuz berdi. Sahifani qayta yuklab ko&apos;ring yoki bosh sahifaga qayting.</p>
        <ErrorState title="Sahifa vaqtincha ishlamayapti" description={error?.digest ? `Xatolik kodi: ${error.digest}` : undefined} onRetry={reset} />
        <Link href="/" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><Home className="size-4" aria-hidden="true" />Bosh sahifaga qaytish</Link>
      </div>
    </main>
  )
}
