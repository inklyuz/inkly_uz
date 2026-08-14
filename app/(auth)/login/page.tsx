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

const loginSchema = z.object({
  email: z.string().email("Yaroqli email kiriting"),
  password: z.string().min(6, "Parol kamida 6ta belgi bo'lishi kerak"),
})

type LoginData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    setError(null)
    try {
      const tokens = await authApi.login(data)
      await login(tokens)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Email yoki parol noto'g'ri")
    }
  }

  return (
    <AuthShell
      title="Xush kelibsiz"
      subtitle={
        <>
          Hali akkauntingiz yo'qmi?{" "}
          <Link href="/register" className="font-medium text-[#FF6A00] hover:underline">
            Ro'yxatdan o'ting
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
          label="Email manzilingiz"
          type="email"
          autoComplete="email"
          placeholder="ism@gmail.com"
          error={errors.email?.message}
          {...register("email")}
        />
        
        <Input
          label="Parolingiz"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" variant="accent" loading={isSubmitting} className="mt-2">
          Tizimga kirish
        </Button>
      </form>
    </AuthShell>
  )
}
