"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

/**
 * components/ui/back-button.tsx
 *
 * Brauzer tarixida oldingi sahifa bo'lsa — orqaga qaytadi.
 * Bo'lmasa (to'g'ridan-to'g'ri havola orqali kelgan) — /posts ga yo'naltiradi.
 */
export function BackButton() {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/posts")
    }
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
    >
      <ArrowLeft size={16} strokeWidth={1.8} />
      Orqaga
    </button>
  )
}