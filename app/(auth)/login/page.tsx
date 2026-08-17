"use client"

import { Suspense, useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { AuthShell } from "@/components/auth/auth-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TelegramLoginWidget } from "@/components/auth/telegram-login-widget"

const loginSchema = z.object({
  email: z.string().email("Yaroqli email kiriting"),
  password: z.string().min(1, "Parolni kiriting"),
})

type LoginData = z.infer<typeof loginSchema>

export default function LoginPage() {
  return <Suspense fallback={null}><LoginForm /></Suspense>
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const next = searchParams.get("next")
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
  const telegramSuccess = useCallback(() => router.replace(destination), [destination, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginData) => {
    setError(null)
    try {
      // Login → { tokens: { access_token, refresh_token, ... } }
      const { tokens } = await authApi.login(data)
      await login(tokens)
      router.replace(destination)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email yoki parol noto'g'ri")
    }
  }

  return (
    <AuthShell
      title="Xush kelibsiz"
      subtitle={
        <>
          Hali akkauntingiz yo'qmi?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-control bg-destructive/10 p-3 text-sm text-destructive">
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
          label={
            <div className="flex items-center justify-between">
              <span>Parolingiz</span>
              <Link
                href="/forgot-password"
                className="text-xs font-normal text-primary hover:underline"
                tabIndex={-1}
              >
                Parolni unutdingizmi?
              </Link>
            </div>
          }
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

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-text-muted">Yoki</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={async () => {
            try {
              const res = await authApi.getGoogleUrl()
              window.location.href = res.authorization_url
            } catch {
              setError("Google orqali kirishda xatolik yuz berdi")
            }
          }}
          className="w-full flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google orqali kirish
        </Button>

        <div className="flex w-full flex-col items-center gap-3 rounded-control border border-border bg-background px-4 py-4">
          <p className="text-sm font-medium text-foreground">Telegram orqali kirish</p>
          <TelegramLoginWidget onSuccess={telegramSuccess} />
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/telegram")}
          className="hidden w-full items-center justify-center gap-2"
        >
          <svg className="h-5 w-5 text-[#24A1DE]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Telegram orqali kirish
        </Button>
      </div>
    </AuthShell>
  )
}
