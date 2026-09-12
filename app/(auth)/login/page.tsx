"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { AuthMethods } from "@/components/auth/auth-methods"
import { loginSchema, type LoginData } from "@/components/auth/auth-constants"
import {
  AuthPageLayout,
  AuthBrandPanel,
  AuthCardShell,
  AuthCardHeader,
  AuthErrorBanner,
} from "@/components/auth/auth-shared"
import {
  StyledInput,
  SubmitButton,
  Divider,
  AlertIcon,
  MailIcon,
  LockIcon,
} from "@/components/auth/auth-visuals"
import { PasswordToggle } from "@/components/auth/register-steps"

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedNext = searchParams.get("next")
  // Only allow same-origin internal paths. Never redirect to an arbitrary
  // absolute/protocol-relative URL supplied by a query parameter.
  const next =
    requestedNext &&
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//") &&
    !/^[a-z][a-z0-9+.-]*:/i.test(requestedNext)
      ? requestedNext
      : "/dashboard"
  const reason = searchParams.get("reason")
  const { login } = useAuth()

  const [error, setError] = useState<string | null>(
    reason === "blocked"
      ? "Akkauntingiz bloklangan. Qo'shimcha ma'lumot uchun support@inkly.uz ga murojaat qiling."
      : null
  )
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  })

  async function onSubmit(data: LoginData) {
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.login(data)
      // AuthContext state'ni yangilaymiz (token saqlash + user fetch)
      await login(res.tokens)
      // window.location.replace() — to'liq sahifa yangilanishi bilan yo'naltiramiz.
      // router.replace() + router.refresh() kombinatsiyasi race condition yaratadi:
      // layout.tsx !user tekshiruvi AuthContext dispatch'dan avval ishlashi mumkin.
      // To'liq reload bilan brauzer inkly_refresh cookie'ni yuboradi,
      // middleware ko'radi va /dashboard'ga o'tkazadi.
      window.location.replace(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirishda xatolik yuz berdi")
      setFocus("password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageLayout>
      {/* Chap brand panel */}
      <AuthBrandPanel
        title={
          <>
            Xush kelibsiz,<br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--color-inkly-orange), var(--color-inkly-coral))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              davom eting.
            </span>
          </>
        }
        description="Hisobingizga kiring va yozishni, ulashishni hamda auditoriyangiz bilan muloqotni davom ettiring."
      />

      {/* O'ng forma */}
      <AuthCardShell>
        <AuthCardHeader />

        <div style={{ marginBottom: 20 }}>
          <h2
            className="text-2xl font-bold tracking-tight leading-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Tizimga kiring
          </h2>
          <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
            Email yoki foydalanuvchi nomingiz va parolingizni kiriting.
          </p>
        </div>

        <AuthErrorBanner message={error} />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {/* Login maydoni */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login"
              className="text-[13px] font-semibold"
              style={{ color: "var(--color-text-label)" }}
            >
              Email yoki foydalanuvchi nomi
            </label>
            <StyledInput
              id="login"
              type="text"
              autoComplete="username"
              placeholder="ism@gmail.com yoki username"
              hasError={!!errors.login}
              leftIcon={<MailIcon size={16} />}
              autoFocus
              aria-describedby={errors.login ? "login-error" : undefined}
              {...register("login")}
            />
            {errors.login && (
              <p
                id="login-error"
                className="text-xs flex items-center gap-1.5"
                style={{ color: "var(--color-warning)" }}
                role="alert"
              >
                <AlertIcon size={12} />
                {errors.login.message}
              </p>
            )}
          </div>

          {/* Parol maydoni */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[13px] font-semibold"
                style={{ color: "var(--color-text-label)" }}
              >
                Parol
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium transition-opacity hover:opacity-80"
                style={{ color: "var(--color-inkly-orange)" }}
              >
                Parolni unutdingizmi?
              </Link>
            </div>
            <StyledInput
              id="password"
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              hasError={!!errors.password}
              leftIcon={<LockIcon size={16} />}
              rightElement={
                <PasswordToggle shown={showPass} onToggle={() => setShowPass((v) => !v)} />
              }
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            {errors.password && (
              <p
                id="password-error"
                className="text-xs flex items-center gap-1.5"
                style={{ color: "var(--color-warning)" }}
                role="alert"
              >
                <AlertIcon size={12} />
                {errors.password.message}
              </p>
            )}
          </div>

          <SubmitButton label="Kirish" loading={loading} />
        </form>

        <Divider />
        <AuthMethods onTelegramSuccess={(username) => {
          // next URL belgilangan bo'lsa u yerga, aks holda profil sahifasiga
          const dest = (next && next !== "/dashboard")
            ? next
            : (username ? `/@${username}` : "/dashboard")
          window.location.replace(dest)
        }} />

        {/* Xavfsizlik eslatmasi */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <p className="text-center text-xs" style={{ color: "#9CA3AF" }}>
            Ma&apos;lumotlaringiz xavfsiz saqlanadi
          </p>
        </div>

        <p className="mt-5 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          Akkauntingiz yo&apos;qmi?{" "}
          <Link
            href="/register"
            className="font-semibold transition-opacity hover:opacity-80"
            style={{ color: "var(--color-inkly-orange)" }}
          >
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </p>
      </AuthCardShell>
    </AuthPageLayout>
  )
}