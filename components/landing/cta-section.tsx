import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Container } from "@/components/layout/containers"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/ui/logo"

export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative isolate overflow-hidden bg-[#141414] px-4 py-24 sm:px-6 sm:py-32"
    >
      {/* Fon teksturasi — ingichka grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient glow — chap yuqori */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,106,0,0.18) 0%, transparent 65%)",
        }}
      />

      {/* Ambient glow — o'ng pastki */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,138,61,0.10) 0%, transparent 65%)",
        }}
      />

      <Container variant="marketing" className="relative z-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">

          {/* Logo belgisi */}
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <LogoMark size={24} className="text-[var(--color-inkly-orange)]" />
          </div>

          {/* Sarlavha */}
          <h2
            id="cta-heading"
            className="font-display text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] text-white text-balance sm:text-[42px] lg:text-[52px]"
          >
            Fikringiz
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--color-inkly-orange) 0%, var(--color-inkly-coral) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              o&apos;quvchi topadi.
            </span>
          </h2>

          {/* Tavsif */}
          <p className="mt-5 max-w-md text-[15px] leading-[1.7] text-white/50 sm:text-[16px]">
            Inkly&apos;da maqola yozing, shaxsiy blogingizni yarating va
            auditoriyangizni shakllantiring — bepul va hech qanday cheklovsiz.
          </p>

          {/* Harakatga chaqiruv tugmalari */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button variant="primary" size="lg" className="gap-2 px-6">
                Yozishni boshlash
                <ArrowRight size={15} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="onDark" size="lg" className="px-6">
                Kirish
              </Button>
            </Link>
          </div>

          {/* Ishonch belgisi */}
          <p className="mt-8 text-[13px] text-white/25">
            Ro&apos;yxatdan o&apos;tish bepul · Kredit karta talab etilmaydi
          </p>
        </div>
      </Container>
    </section>
  )
}