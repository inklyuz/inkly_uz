"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2, Mail, MessageCircle,
  Loader2, Globe, Send,
} from "lucide-react"
import { HeroBackground } from "@/components/landing/hero-background"
import { cn } from "@/lib/utils"

type ContactType = "telegram" | "gmail"

export function WaitlistSection() {
  const [username,    setUsername]    = useState("")
  const [contact,     setContact]     = useState("")
  const [contactType, setContactType] = useState<ContactType>("telegram")
  const [status,      setStatus]      = useState<"idle" | "loading" | "success">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !contact.trim()) return
    setStatus("loading")
    await new Promise((r) => setTimeout(r, 1200))
    // TODO: POST /api/waitlist { username, contact, contactType }
    setStatus("success")
  }

  return (
    <section
      id="waitlist-section"
      className="relative overflow-hidden border-b border-[#E8E3DD] bg-[#FFF9F3] px-4 py-24 sm:px-6"
    >
      {/* ── Hero bilan bir xil orqa fon ────────────────────────────── */}
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-lg text-center">

        {/* Badge — orange accent */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/25 bg-[#FFF3E8] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#141414]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF6A00]" />
          Tez kunda ishga tushadi
        </div>

        <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-balance text-[#141414] sm:text-5xl">
          Username ni hoziroq{" "}
          <span className="text-[#FF6A00]">band qiling</span>
        </h2>

        <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-[#36565F]">
          Inkly ishga tushganda birinchilar qatorida bo&apos;ling —
          Telegram yoki Gmail orqali xabar beramiz.
        </p>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            /* ── Muvaffaqiyat holati ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-10 flex flex-col items-center gap-3"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#FF6A00]/25 bg-[#FFF3E8]">
                <CheckCircle2 size={32} className="text-[#FF6A00]" />
              </div>
              <p className="text-lg font-bold text-[#141414]">Saqlandi!</p>
              <p className="text-sm text-[#36565F]">
                <span className="font-semibold text-[#FF6A00]">@{username}</span>{" "}
                — username band qilindi. Ishga tushganda xabar beramiz.
              </p>
            </motion.div>
          ) : (
            /* ── Forma ── */
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-col gap-3"
            >

              {/* ── Username input ── */}
              <div className="flex w-full items-center gap-2 rounded-2xl border border-[#E8E3DD] bg-white p-1.5 shadow-lg shadow-[#141414]/5 transition-colors focus-within:border-[#FF6A00]">
                <div className="flex min-w-0 flex-1 items-center gap-2 pl-3">
                  <Globe size={18} className="shrink-0 text-[#6B7280]" aria-hidden />
                  <div className="flex min-w-0 flex-1 items-baseline">
                    <span className="shrink-0 text-sm font-medium leading-none text-[#141414]">
                      inkly.uz/@
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase(),
                        )
                      }
                      placeholder="username"
                      autoComplete="off"
                      spellCheck={false}
                      pattern="[a-zA-Z0-9_]{3,30}"
                      required
                      aria-label="Foydalanuvchi nomi"
                      className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-[#FF6A00] placeholder:text-[#FF6A00]/40 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ── Telegram / Gmail toggle ── */}
              <div className="flex overflow-hidden rounded-2xl border border-[#E8E3DD] bg-white shadow-sm">

                {/* Telegram */}
                <button
                  type="button"
                  onClick={() => { setContactType("telegram"); setContact("") }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2.5 py-3.5 text-sm font-semibold transition-all",
                    contactType === "telegram"
                      ? "bg-[#FFF3E8] text-[#FF6A00]"
                      : "text-[#6B7280] hover:text-[#141414] hover:bg-[#FFF9F3]",
                  )}
                >
                  {/* Telegram SVG logo */}
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </button>

                <div className="w-px bg-[#E8E3DD]" />

                {/* Gmail */}
                <button
                  type="button"
                  onClick={() => { setContactType("gmail"); setContact("") }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2.5 py-3.5 text-sm font-semibold transition-all",
                    contactType === "gmail"
                      ? "bg-[#FFF3E8] text-[#141414]"
                      : "text-[#6B7280] hover:text-[#141414] hover:bg-[#FFF9F3]",
                  )}
                >
                  {/* Gmail SVG logo */}
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                  Gmail
                </button>
              </div>

              {/* ── Contact input ── */}
              <div className={cn(
                "flex w-full items-center gap-2 rounded-2xl border bg-white p-1.5 shadow-lg shadow-[#141414]/5 transition-colors",
                contactType === "telegram"
                  ? "border-[#E8E3DD] focus-within:border-[#FF6A00]"
                  : "border-[#E8E3DD] focus-within:border-[#FF6A00]",
              )}>
                <div className="flex min-w-0 flex-1 items-center gap-2 pl-3">
                  {contactType === "telegram" ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#36565F]" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#36565F]" fill="currentColor">
                      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                    </svg>
                  )}
                  <div className="flex min-w-0 flex-1 items-baseline">
                    {contactType === "telegram" && (
                      <span className="shrink-0 text-sm font-medium leading-none text-[#141414]">@</span>
                    )}
                    <input
                      type={contactType === "gmail" ? "email" : "text"}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={
                        contactType === "telegram"
                          ? "telegram_username"
                          : "sizning@gmail.com"
                      }
                      required
                      aria-label="Aloqa ma'lumoti"
                      className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-[#141414] placeholder:text-[#6B7280] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A00] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#FF6A00]/20 transition hover:bg-[#E85F00] hover:shadow-[#FF6A00]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {status === "loading" ? "Saqlanmoqda..." : "Username band qilish"}
              </button>

              <p className="mt-1 text-center text-xs text-[#6B7280]">
                Spam yo&apos;q. Faqat ishga tushganda bir marta xabar beramiz.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}