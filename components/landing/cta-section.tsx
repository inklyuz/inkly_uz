import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/layout/containers"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/ui/logo"

export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative isolate overflow-hidden bg-[#141414]"
      style={{ minHeight: "480px" }}
    >
      {/* Grid tekstura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Nuqtalar — chap yuqori */}
      <div aria-hidden="true" className="pointer-events-none absolute top-6 left-6 grid grid-cols-3 gap-[6px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-[3px] w-[3px] rounded-full bg-white/20" />
        ))}
      </div>

      {/* Nuqtalar — o'ng pastki */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-6 right-6 grid grid-cols-3 gap-[6px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-[3px] w-[3px] rounded-full bg-white/20" />
        ))}
      </div>

      {/* Glow — chap yuqori */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,106,0,0.22) 0%, transparent 60%)" }}
      />

      {/* Aylana — chap */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-10 h-20 w-20 rounded-full border border-[rgba(255,106,0,0.22)]"
      />

      {/* Glow — o'ng pastki (mushuk tagida) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 right-32 h-[360px] w-[360px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,106,0,0.20) 0%, transparent 65%)" }}
      />

      {/* Mushuk — absolute, o'ng tomonda to'liq balandlikda */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 hidden lg:block"
        style={{ width: 620, height: "100%" }}
      >
        {/* Mushuk ostidagi glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-24 w-80"
          style={{
            background: "radial-gradient(ellipse, rgba(255,106,0,0.45) 0%, transparent 70%)",
            filter: "blur(24px)",
          }}
        />
        <Image
          src="/cat.png"
          alt=""
          fill
          className="object-contain object-bottom select-none"
          priority
        />
      </div>

      {/* Kontent */}
      <Container variant="marketing" className="relative z-10">
        <div className="flex min-h-[480px] flex-col justify-center py-20 lg:max-w-[55%]">

          {/* LogoMark */}
          <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <LogoMark size={22} className="text-[var(--color-inkly-orange)]" />
          </div>

          {/* Sarlavha */}
          <h2
            id="cta-heading"
            className="font-display text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-white text-balance sm:text-[52px] lg:text-[64px]"
          >
            Fikringiz
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, var(--color-inkly-orange) 0%, var(--color-inkly-coral) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              o&apos;quvchi topadi.
            </span>
          </h2>

          {/* Tavsif */}
          <p className="mt-5 max-w-md text-[15px] leading-[1.75] text-white/50 sm:text-[16px]">
            Inkly&apos;da maqola yozing, shaxsiy bloggingizni yarating va
            auditoriyangizni shakllantiring — bepul va hech qanday cheklovsiz.
          </p>

          {/* Tugmalar */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/register">
              <Button variant="primary" size="lg" className="gap-2 px-8">
                Yozishni boshlash
                <ArrowRight size={15} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="onDark" size="lg" className="px-8">
                Kirish
              </Button>
            </Link>
          </div>

          {/* Ishonch matni */}
          <p className="mt-6 text-[13px] text-white/25">
            Ro&apos;yxatdan o&apos;tish bepul · Kredit karta talab etilmaydi
          </p>
        </div>
      </Container>
    </section>
  )
}