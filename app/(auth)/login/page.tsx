"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"

const schema = z.object({
  email: z.string().email("To'g'ri email kiriting"),
  password: z.string().min(1, "Parol kerak"),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const pair = await authApi.login(data)
      await login(pair)
      toast.success("Xush kelibsiz!")
      router.push("/")
    } catch (error) {
      toast.error((error as Error)?.message ?? "Kirish muvaffaqiyatsiz bo'ldi")
    }
  }

  return (
    <AuthShell
      title="Kirish"
      subtitle={
        <>
          Hisobingizga kiring yoki{" "}
          <Link href="/register" className="font-medium text-ink-900 underline underline-offset-4">
            ro&apos;yxatdan o&apos;ting
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="siz@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Parol"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-ink-400 underline underline-offset-4 hover:text-ink-900"
          >
            Parolni unutdingizmi?
          </Link>
        </div>

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Kirish
        </Button>
      </form>
    </AuthShell>
  )
}
