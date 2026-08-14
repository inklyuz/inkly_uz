"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { AuthShell } from "@/components/auth/auth-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const registerSchema = z.object({
  full_name: z.string().min(2, "Ism kiritilishi shart"),
  email: z.string().email("Yaroqli email kiriting"),
  password: z.string().min(6, "Parol kamida 6ta belgi bo'lishi kerak"),
})

type RegisterData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterData) => {
    setError(null)
    try {
      const res = await authApi.register(data)
      await login(res.tokens)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi")
    }
  }

  return (
    <AuthShell
      title="Inkly'ga qo'shiling"
      subtitle={
        <>
          Akkauntingiz bormi?{" "}
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
        
        <Input
          label="To'liq ismingiz"
          type="text"
          autoComplete="name"
          placeholder="Ism Familiya"
          error={errors.full_name?.message}
          {...register("full_name")}
        />

        <Input
          label="Email manzilingiz"
          type="email"
          autoComplete="email"
          placeholder="ism@gmail.com"
          error={errors.email?.message}
          {...register("email")}
        />
        
        <Input
          label="Parol"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" variant="accent" loading={isSubmitting} className="mt-2">
          Ro'yxatdan o'tish
        </Button>
      </form>
    </AuthShell>
  )
}
