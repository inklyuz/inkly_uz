"use client"

import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { HeroBackground } from "@/components/landing/hero-background"

export function WaitlistSection() {
  return (
    <section
      id="waitlist-section"
      className="relative overflow-hidden border-b border-[#E8E3DD] bg-white px-4 py-24 sm:px-6"
    >
      {/* ── Hero bilan bir xil orqa fon ────────────────────────────── */}
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Badge — orange accent */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/25 bg-[#FFF3E8] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#141414]">
          <Sparkles size={14} className="text-[#FF6A00]" />
          Tez kunda ishga tushadi
        </div>

        <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-balance text-[#141414] sm:text-5xl">
          Username ni hoziroq{" "}
          <span className="text-[#FF6A00]">band qiling</span>
        </h2>

        <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-[#36565F]">
          Inkly ishga tushganda birinchilar qatorida bo&apos;ling.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6A00] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#FF6A00]/20 transition hover:bg-[#E85F00] hover:shadow-[#FF6A00]/30 active:scale-[0.98]"
          >
            Ro'yxatdan o'tish
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8E3DD] bg-white px-6 py-4 text-base font-semibold text-[#141414] shadow-sm transition hover:border-[#FF6A00] hover:bg-[#FFF3E8] hover:text-[#FF6A00] active:scale-[0.98]"
          >
            Tizimga kirish
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Spam yo&apos;q. Faqat ishga tushganda bir marta xabar beramiz.
        </p>
      </div>
    </section>
  )
}