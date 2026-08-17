"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/input"

// Eslatma: Backend hozirda /creators endpoint bermaydi.
// Bu sahifa faqat UI ko'rinishi saqlanadi — muallif bo'lish
// to'g'ridan-to'g'ri ro'yxatdan o'tish orqali amalga oshadi.
export default function ApplyPage() {
  const router = useRouter()
  const { state } = useAuth()

  const [description, setDescription] = useState("")
  const [success, setSuccess] = useState(false)

  if (!state.loading && !state.user) {
    router.replace("/login")
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    // Hozircha faqat UI — backend endpoint tayyor bo'lgunicha
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="mx-auto mt-20 max-w-lg text-center px-4">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFE9D6] text-[#FF6A00]">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#141414]">Rahmat!</h1>
        <p className="mt-4 text-[#36565F]">
          Siz allaqachon Inkly a&apos;zosisiz. Maqola yozishni boshlashingiz mumkin.
        </p>
        <Button variant="accent" className="mt-8" onClick={() => router.push("/write")}>
          Maqola yozish
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-16 max-w-lg px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#141414]">Muallif bo'lish</h1>
        <p className="mt-3 text-[#36565F]">
          Inkly platformasida o&apos;z maqolalaringizni yozish uchun ro&apos;yxatdan o&apos;ting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E8E3DD] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6">
          <Textarea
            label="O'zingiz haqingizda"
            placeholder="Qaysi mavzularda yozmoqchisiz?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
          />

          <Button type="submit" variant="accent" size="lg" className="w-full">
            Yuborish
          </Button>
        </div>
      </form>
    </div>
  )
}
