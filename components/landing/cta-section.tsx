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
      className="relative isolate overflow-hidden bg-[#141414] px-4 py-20 sm:px-6 sm:py-28"
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
      <div aria-hidden="true" className="pointer-events-none absolute top-8 left-8 grid grid-cols-3 gap-[6px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-[3px] w-[3px] rounded-full bg-white/20" />
        ))}
      </div>

      {/* Nuqtalar — o'ng pastki */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-8 right-8 grid grid-cols-3 gap-[6px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-[3px] w-[3px] rounded-full bg-white/20" />
        ))}
      </div>

      {/* Glow — chap */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,106,0,0.22) 0%, transparent 65%)" }}
      />

      {/* Glow — o'ng pastki */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-1/3 h-[300px] w-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,106,0,0.12) 0%, transparent 65%)" }}
      />

      {/* Aylana dekoratsiya — chap */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-12 h-20 w-20 rounded-full border border-[rgba(255,106,0,0.25)]"
      />

      <Container variant="marketing" className="relative z-10">
        <div className="flex flex-col items-start gap-12 lg:flex-row lg:items-end lg:justify-between">

          {/* Chap — kontent */}
          <div className="flex max-w-xl flex-col items-start">

            {/* LogoMark */}
            <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <LogoMark size={22} className="text-[var(--color-inkly-orange)]" />
            </div>

            {/* Sarlavha */}
            <h2
              id="cta-heading"
              className="font-display text-[36px] font-bold leading-[1.1] tracking-[-0.03em] text-white text-balance sm:text-[48px] lg:text-[56px]"
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
            <p className="mt-5 text-[15px] leading-[1.7] text-white/50 sm:text-[16px]">
              Inkly&apos;da maqola yozing, shaxsiy bloggingizni yarating va
              auditoriyangizni shakllantiring — bepul va hech qanday cheklovsiz.
            </p>

            {/* Tugmalar */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register">
                <Button variant="primary" size="lg" className="gap-2 px-7">
                  Yozishni boshlash
                  <ArrowRight size={15} />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="onDark" size="lg" className="px-7">
                  Kirish
                </Button>
              </Link>
            </div>

            {/* Ishonch matni */}
            <p className="mt-6 text-[13px] text-white/25">
              Ro&apos;yxatdan o&apos;tish bepul · Kredit karta talab etilmaydi
            </p>
          </div>

          {/* O'ng — mushuk rasmi */}
          <div className="relative flex-shrink-0 self-end lg:self-auto">
            {/* Pastki glow mushuk ostida */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-1/2 h-24 w-64 -translate-x-1/2"
              style={{
                background: "radial-gradient(ellipse, rgba(255,106,0,0.35) 0%, transparent 70%)",
                filter: "blur(16px)",
              }}
            />
            <Image
              src="/cat.png"
              alt=""
              aria-hidden="true"
              width={520}
              height={420}
              className="relative z-10 w-[280px] select-none sm:w-[380px] lg:w-[480px]"
              priority
            />
          </div>

        </div>
      </Container>
    </section>
  )
}