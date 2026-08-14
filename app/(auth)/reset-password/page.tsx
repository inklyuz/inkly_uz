"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authApi } from "@/lib/api/auth"
import { AuthShell } from "@/components/auth/auth-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const resetSchema = z.object({
  code: z.string().length(6, "Kod 6 xonali bo'lishi kerak"),
  new_password: z.string().min(6, "Parol kamida 6ta belgi bo'lishi kerak"),
})

type ResetData = z.infer<typeof resetSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
  })

  // Agar URL da email bo'lmasa, login sahifasiga qaytaramiz
  if (!email) {
    if (typeof window !== "undefined") router.push("/login")
    return null
  }

  const onSubmit = async (data: ResetData) => {
    setError(null)
    try {
      await authApi.resetPassword({
        email,
        code: data.code,
        new_password: data.new_password,
      })
      setSuccessMsg("Parol muvaffaqiyatli tiklandi. Login sahifasiga o'tilmoqda...")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Kod noto'g'ri yoki muddati tugagan")
    }
  }

  return (
    <AuthShell
      title="Yangi parol"
      subtitle={
        <>
          {email} manziliga 6 xonali kod yuborildi.
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-lg bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg bg-[#16A34A]/10 p-3 text-sm text-[#16A34A]">
            {successMsg}
          </div>
        )}

        <Input
          label="Tasdiqlash kodi"
          type="text"
          placeholder="123456"
          error={errors.code?.message}
          {...register("code")}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6)
            setValue("code", val)
          }}
          className="text-center text-2xl tracking-widest font-mono"
        />

        <Input
          label="Yangi parol"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.new_password?.message}
          {...register("new_password")}
        />

        <Button type="submit" variant="accent" loading={isSubmitting} className="mt-2" disabled={!!successMsg}>
          Parolni yangilash
        </Button>
        
        <div className="text-center mt-2 text-sm">
          <Link href="/login" className="text-[#6B7280] hover:text-[#141414] transition-colors">
            Bekor qilish va ortga qaytish
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yuklanmoqda...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
