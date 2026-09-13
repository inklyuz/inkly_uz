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
        className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,106,0,0.20) 0%, transparent 65%)" }}
      />

      {/* Aylana dekoratsiya — chap */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-10 h-16 w-16 rounded-full border border-[rgba(255,106,0,0.20)]"
      />

      {/* Glow — o'ng pastki (mushuk tagida) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 right-24 h-[280px] w-[280px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,106,0,0.18) 0%, transparent 65%)" }}
      />

      <Container variant="marketing" className="relative z-10">
        <div className="flex flex-col items-start gap-0 lg:flex-row lg:items-end lg:justify-between">

          {/* Chap — kontent */}
          <div className="flex max-w-xl flex-col items-start pb-0 lg:pb-0">

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

          {/* O'ng — mushuk pastdan mo'ralab turadi */}
          <div className="relative hidden lg:block flex-shrink-0">
            {/* Mushuk panjalar pastki chegaraga yopishadi */}
            <div
              className="relative overflow-hidden"
              style={{ width: 480, height: 340 }}
            >
              {/* Pastki glow */}
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-20 w-72"
                style={{
                  background: "radial-gradient(ellipse, rgba(255,106,0,0.40) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />
              <Image
                src="/cat.png"
                alt=""
                aria-hidden="true"
                fill
                className="object-contain object-bottom select-none"
                priority
              />
            </div>
          </div>

        </div>
      </Container>
    </section>
  )
}