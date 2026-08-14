"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Backend API bilan ulanish yoki oddiy simulyatsiya
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 1000)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#141414]">Biz bilan aloqa</h1>
        <p className="mt-4 text-lg text-[#36565F]">
          Savollaringiz bormi yoki hamkorlik qilmoqchimisiz? Bizga yozing.
        </p>
      </div>

      {success ? (
        <div className="rounded-2xl border border-[#E8E3DD] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFE9D6] text-[#FF6A00]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#141414]">Xabaringiz yuborildi!</h2>
          <p className="mt-2 text-[#36565F]">Tez orada siz bilan bog'lanamiz.</p>
          <Button onClick={() => setSuccess(false)} variant="ghost" className="mt-6">
            Yangi xabar yozish
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E8E3DD] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Input label="Ismingiz" required placeholder="Sardor" />
              <Input label="Email manzilingiz" type="email" required placeholder="sardor@example.com" />
            </div>
            <Textarea
              label="Xabaringiz"
              required
              placeholder="Fikrlaringiz yoki savollaringizni shu yerga yozing..."
              rows={6}
            />
            <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full">
              Xabarni yuborish
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
