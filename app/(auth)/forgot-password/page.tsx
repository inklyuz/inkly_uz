"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authApi } from "@/lib/api/auth"
import { AuthShell } from "@/components/auth/auth-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const forgotSchema = z.object({
  email: z.string().email("Yaroqli email kiriting"),
})

type ForgotData = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotData) => {
    setError(null)
    try {
      await authApi.forgotPassword(data.email)
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`)
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi. Iltimos qayta urinib ko'ring.")
    }
  }

  return (
    <AuthShell
      title="Parolni tiklash"
      subtitle={
        <>
          Esingizga tushdimi?{" "}
          <Link href="/login" className="font-medium text-[#FF6A00] hover:underline">
            Tizimga kiring
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-lg bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]">
            {error}
          </div>
        )}
        
        <p className="text-sm text-[#36565F]">
          Elektron pochtangizni kiriting, biz sizga parolni tiklash uchun 6 xonali kod yuboramiz.
        </p>

        <Input
          label="Email manzilingiz"
          type="email"
          autoComplete="email"
          placeholder="ism@gmail.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button type="submit" variant="accent" loading={isSubmitting} className="mt-2">
          Kodni olish
        </Button>
      </form>
    </AuthShell>
  )
}
