"use client"

import {
  Suspense,
  useEffect,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"
import { LogoMark } from "@/components/ui/logo"
import { AuthMethods } from "@/components/auth/auth-methods"


// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Yaroqli email kiriting"),
  password: z.string().min(1, "Parolni kiriting"),
})

type LoginData = z.infer<typeof loginSchema>


// ─────────────────────────────────────────────────────────────────────────────
// QUOTES
// ─────────────────────────────────────────────────────────────────────────────

const QUOTES = [
  {
    text: "Inkly mening yozish tarzimni butunlay o'zgartirdi. Endi har bir fikrim tartibli va ilhomli.",
    author: "Nilufar Rashidova",
    role: "Muallif · 340 ta maqola",
  },
  {
    text: "Oddiy blogerdan professional muallifga o'tish uchun menga aynan Inkly kerak edi.",
    author: "Jasur Toshmatov",
    role: "Texnologiya bloggeri",
  },
  {
    text: "Inklyda yozish — qog'ozga yozganday hissiyot, lekin dunyo bilan ulashish imkoniyati bilan.",
    author: "Zulfiya Mirzayeva",
    role: "Ijodkor yozuvchi",
  },
  {
    text: "Inkly’ni yaratishdagi eng katta ilhomim — odamlar bilan bevosita muloqot qilish va ularning fikrlaridan yangi g‘oyalar olish.",
    author: "Diyorbek Abdumutalibov",
    role: "Inkly.uz asoschisi",
  },
]


// ─────────────────────────────────────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    text: "Qulay muharrir bilan yozish",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    text: "Dunyo bilan ulashish imkoni",
  },
  {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    text: "Odamlar tahlili va statistika",
  },
]


// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

function MailIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function LockIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function AlertIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function ShieldIcon({ size = 13, style }: { size?: number; style?: { color?: string; [key: string]: unknown } }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// SNAKE WAVE BACKGROUND
// ─────────────────────────────────────────────────────────────────────────────

function SnakeWaveBackground() {
  const waveYPositions = [-40, 40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920]

  return (
    <>
      {/* Wave lines */}
      <svg
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 800 900"
      >
        {waveYPositions.map((y, i) => (
          <path
            key={i}
            d={`M -80 ${y} Q 100 ${y - 70}, 280 ${y} Q 460 ${y + 70}, 640 ${y} Q 820 ${y - 70}, 1000 ${y}`}
            fill="none"
            stroke="#C4C8CF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Center fade — karta atrofini yumshatadi */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(244,245,247,0.82) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// STYLED INPUT
// ─────────────────────────────────────────────────────────────────────────────

interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  leftIcon?: ReactNode
  rightElement?: ReactNode
}

function StyledInput({ hasError, leftIcon, rightElement, style, ...props }: StyledInputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: "14px",
        padding: "1.5px",
        background: focused
          ? "linear-gradient(135deg, #FF6A00, #FF8A3D)"
          : hasError
            ? "linear-gradient(135deg, #F97316, #FB923C)"
            : "linear-gradient(135deg, #E5E7EB, #F3F4F6)",
        boxShadow: focused
          ? "0 0 0 4px rgba(255,106,0,0.12), 0 2px 8px rgba(255,106,0,0.15)"
          : hasError
            ? "0 0 0 3px rgba(249,115,22,0.10)"
            : "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        transition: "box-shadow 180ms cubic-bezier(0.23,1,0.32,1), background 180ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "12.5px",
          overflow: "hidden",
          background: focused ? "#FFFFFF" : "#FAFAFA",
          transition: "background 180ms ease",
        }}
      >
        {leftIcon && (
          <span
            style={{
              position: "absolute",
              left: "13px",
              top: "50%",
              transform: "translateY(-50%)",
              color: focused ? "#FF6A00" : "#9CA3AF",
              transition: "color 180ms ease",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {leftIcon}
          </span>
        )}

        <input
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
          style={{
            width: "100%",
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: "#141414",
            paddingLeft: leftIcon ? "40px" : "14px",
            paddingRight: rightElement ? "44px" : "14px",
            paddingTop: "11px",
            paddingBottom: "11px",
            ...style,
          }}
        />

        {rightElement && (
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginLayout />
    </Suspense>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

function LoginLayout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, login } = useAuth()

  const { user, loading: authLoading } = state

  const [error, setError] = useState<string | null>(null)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)
  const [showPass, setShowPass] = useState(false)

  const next = searchParams.get("next")
  const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"


  // ── AUTH REDIRECT ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user) router.replace(destination)
  }, [authLoading, user, router, destination])


  // ── QUOTES SLIDER ──────────────────────────────────────────────────────────

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteVisible(false)
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length)
        setQuoteVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(id)
  }, [])


  // ── FORM ───────────────────────────────────────────────────────────────────

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    setError(null)
    try {
      const { tokens } = await authApi.login(data)
      await login(tokens)
      router.replace(destination)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email yoki parol noto'g'ri")
    }
  }

  const q = QUOTES[quoteIndex]


  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-0 flex w-screen h-screen overflow-hidden"
      style={{ width: "100vw", height: "100dvh", minHeight: "100dvh", background: "#F4F5F7" }}
    >

      {/* ════════════════════════════════════════════════════════════════════
          LEFT PANEL
      ════════════════════════════════════════════════════════════════════ */}

      <aside
        className="hidden lg:flex lg:w-1/2 h-full min-h-0 min-w-0 relative flex-col justify-between overflow-hidden px-12 py-12"
        style={{ background: "linear-gradient(150deg, #141414 0%, #1a0e06 100%)" }}
      >
        {/* Glow top-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,106,0,0.20) 0%, transparent 70%)" }}
        />
        {/* Glow bottom-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 w-[280px] h-[280px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,138,61,0.10) 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-1.5 shrink-0">
          <LogoMark size={24} className="text-white" />
          <span className="text-white text-lg font-bold tracking-tighter">inkly</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center min-h-0 py-10">
          <div className="space-y-5">

            {/* Badge */}
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em] font-medium"
              style={{ background: "rgba(255,106,0,0.13)", border: "1px solid rgba(255,106,0,0.28)", color: "#FF8A3D" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#FF6A00" }} />
              Yozuvchilar platformasi
            </span>

            {/* Heading */}
            <h1 className="text-5xl xl:text-[3.4rem] font-bold leading-[1.08] tracking-tight text-white">
              Fikrlaringizni<br />
              <span style={{ background: "linear-gradient(90deg, #FF6A00, #FF8A3D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                dunyoga yetkazing
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm leading-relaxed max-w-[280px]" style={{ color: "#6B7280" }}>
              Inkly — yozish, ulashish va o'z auditoriyangizni topish uchun yaratilgan zamonaviy platforma.
            </p>

            {/* Stats */}
            <div className="flex gap-8 pt-1">
              {[
                { value: "12 000+", label: "Faol muallif" },
                { value: "340K+", label: "Odamlar" },
                { value: "98%", label: "Mamnunlik" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl font-bold tabular-nums text-white">{stat.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="flex flex-col gap-2.5 pt-1">
              {FEATURES.map((feature) => (
                <div key={feature.text} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,106,0,0.12)", border: "1px solid rgba(255,106,0,0.20)", color: "#FF8A3D" }}
                  >
                    {feature.icon}
                  </div>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quote */}
        <div
          className="relative z-10 rounded-2xl p-6 shrink-0"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            transition: "opacity 400ms ease, transform 400ms ease",
            opacity: quoteVisible ? 1 : 0,
            transform: quoteVisible ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <span className="text-4xl leading-none font-serif select-none" style={{ color: "#FF6A00" }}>"</span>
          <p className="text-sm leading-relaxed mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>{q.text}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #FF6A00, #FF8A3D)" }}
              >
                {q.author[0]}
              </div>
              <div>
                <div className="text-xs font-medium text-white">{q.author}</div>
                <div className="text-[11px]" style={{ color: "#6B7280" }}>{q.role}</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              {QUOTES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuoteVisible(false)
                    setTimeout(() => { setQuoteIndex(i); setQuoteVisible(true) }, 400)
                  }}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background: i === quoteIndex ? "#FF6A00" : "rgba(255,255,255,0.2)",
                    transform: i === quoteIndex ? "scale(1.4)" : "scale(1)",
                  }}
                  aria-label={`Fikr ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>


      {/* ════════════════════════════════════════════════════════════════════
          RIGHT PANEL
      ════════════════════════════════════════════════════════════════════ */}

      <main
        className="w-full lg:w-1/2 h-full min-h-0 min-w-0 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden"
        style={{
          background: "#F4F5F7",
          position: "relative",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
        }}
      >

        {/* ── SNAKE WAVE PATTERN ── */}
        <SnakeWaveBackground />

        {/* ── CONTENT ── */}
        <div
          className="w-full min-h-full flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10"
          style={{ position: "relative", zIndex: 1 }}
        >

          {/* ════════════════════════════════════════════════════════════════
              LOGIN CARD
          ════════════════════════════════════════════════════════════════ */}

          <section
            className="w-full max-w-[400px]"
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              padding: "28px 24px 24px",
              boxShadow: `
                0 0 0 1px rgba(0,0,0,0.06),
                0 2px 4px rgba(0,0,0,0.04),
                0 8px 20px rgba(0,0,0,0.06),
                0 24px 48px rgba(0,0,0,0.08)
              `,
            }}
          >

            {/* Mobile logo */}
            <div className="flex items-center justify-center gap-1.5 mb-7 lg:hidden">
              <LogoMark size={22} className="text-[#FF6A00]" />
              <span className="text-lg font-bold tracking-tighter" style={{ color: "#141414" }}>inkly</span>
            </div>

            {/* Desktop logo */}
            <div className="hidden lg:flex items-center gap-1.5 mb-7">
              <LogoMark size={22} className="text-[#FF6A00]" />
              <span className="text-lg font-bold tracking-tighter" style={{ color: "#141414" }}>inkly</span>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight leading-tight" style={{ color: "#141414" }}>
                Xush kelibsiz
              </h2>
              <p className="text-sm mt-1.5" style={{ color: "#6B7280" }}>
                Hali akkauntingiz yo'qmi?{" "}
                <Link href="/register" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "#FF6A00" }}>
                  Ro'yxatdan o'ting
                </Link>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm"
                style={{
                  background: "linear-gradient(135deg, #FFF3E8, #FFF7F0)",
                  border: "1px solid rgba(255,106,0,0.25)",
                  color: "#C94F00",
                  boxShadow: "0 2px 8px rgba(255,106,0,0.08)",
                }}
              >
                <AlertIcon size={15} />
                <span className="min-w-0 break-words">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold" style={{ color: "#374151" }}>
                  Email manzilingiz
                </label>
                <StyledInput
                  type="email"
                  autoComplete="email"
                  placeholder="ism@gmail.com"
                  hasError={!!errors.email}
                  leftIcon={<MailIcon size={16} />}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: "#F97316" }}>
                    <AlertIcon size={12} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[13px] font-semibold" style={{ color: "#374151" }}>
                    Parolingiz
                  </label>
                  <Link
                    href="/forgot-password"
                    tabIndex={-1}
                    className="text-xs font-medium transition-opacity hover:opacity-70 shrink-0"
                    style={{ color: "#FF6A00" }}
                  >
                    Parolni unutdingizmi?
                  </Link>
                </div>

                <StyledInput
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  hasError={!!errors.password}
                  leftIcon={<LockIcon size={16} />}
                  rightElement={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPass((v) => !v)}
                      style={{
                        color: "#9CA3AF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        borderRadius: "6px",
                        transition: "color 150ms ease",
                      }}
                      aria-label={showPass ? "Parolni yashirish" : "Parolni ko'rsatish"}
                    >
                      {showPass ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  }
                  {...register("password")}
                />

                {errors.password && (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: "#F97316" }}>
                    <AlertIcon size={12} />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full flex items-center justify-center gap-2.5 rounded-[14px] px-5 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  height: "46px",
                  background: isSubmitting ? "#FF8A3D" : "linear-gradient(135deg, #FF6A00 0%, #FF8A3D 100%)",
                  boxShadow: isSubmitting ? "none" : "0 1px 0 rgba(255,255,255,0.15) inset, 0 4px 16px rgba(255,106,0,0.35), 0 1px 3px rgba(255,106,0,0.20)",
                  transition: "all 180ms cubic-bezier(0.23,1,0.32,1)",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.boxShadow = "0 1px 0 rgba(255,255,255,0.15) inset, 0 6px 24px rgba(255,106,0,0.45), 0 2px 6px rgba(255,106,0,0.25)"
                    e.currentTarget.style.transform = "translateY(-1px)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 0 rgba(255,255,255,0.15) inset, 0 4px 16px rgba(255,106,0,0.35), 0 1px 3px rgba(255,106,0,0.20)"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(0.985)"
                  e.currentTarget.style.boxShadow = "0 1px 0 rgba(255,255,255,0.10) inset, 0 2px 8px rgba(255,106,0,0.25)"
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)"
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Kirish…
                  </>
                ) : (
                  <>
                    Tizimga kirish
                    <span
                      className="flex items-center justify-center w-6 h-6 rounded-full"
                      style={{ background: "rgba(255,255,255,0.20)" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
              <span className="text-xs font-medium px-1 shrink-0" style={{ color: "#9CA3AF" }}>yoki</span>
              <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
            </div>

            {/* Auth methods */}
            <AuthMethods onTelegramSuccess={() => router.replace(destination)} />

            {/* Security */}
            <div className="mt-5 flex items-center justify-center gap-1.5">
              <ShieldIcon size={13} style={{ color: "#9CA3AF" }} />
              <p className="text-center text-xs" style={{ color: "#9CA3AF" }}>
                Ma'lumotlaringiz xavfsiz saqlanadi
              </p>
            </div>

            {/* Legal */}
            <p className="mt-3 text-center text-[11px] leading-relaxed" style={{ color: "#9CA3AF" }}>
              Tizimga kirib, siz{" "}
              <Link href="/terms" className="underline underline-offset-2 transition-colors hover:text-gray-600" style={{ color: "#6B7280" }}>
                foydalanish shartlari
              </Link>{" "}
              va{" "}
              <Link href="/privacy" className="underline underline-offset-2 transition-colors hover:text-gray-600" style={{ color: "#6B7280" }}>
                maxfiylik siyosati
              </Link>{" "}
              ga rozilik bildirasiz.
            </p>

          </section>
        </div>
      </main>
    </div>
  )
}