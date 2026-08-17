// components/ui/back-button.tsx
"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="
        mb-5
        inline-flex
        items-center
        gap-2
        rounded-xl
        px-2.5
        py-2
        text-sm
        text-[#77736C]
        transition-colors
        hover:bg-[#F1ECE5]
        hover:text-[#151515]
      "
      aria-label="Orqaga qaytish"
    >
      <ArrowLeft size={17} strokeWidth={1.8} />
      <span>Orqaga</span>
    </button>
  )
}