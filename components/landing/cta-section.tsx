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
      style={{ minHeight: 480 }}
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

      {/* Glow — chap */}
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

      {/* Glow — mushuk tagida */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-[10%] h-[200px] w-[500px]"
        style={{
          background: "radial-gradient(ellipse, rgba(255,106,0,0.30) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      <Container variant="marketing" className="relative z-10">
        {/* 2 ustunli grid */}
        <div className="grid min-h-[480px] grid-cols-1 items-center gap-0 lg:grid-cols-2">

          {/* Chap — kontent */}
          <div className="flex flex-col justify-center py-16">

            {/* LogoMark */}
            <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <LogoMark size={22} className="text-[var(--color-inkly-orange)]" />
            </div>

            {/* Sarlavha */}
            <h2
              id="cta-heading"
              className="font-display text-[44px] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-[52px] lg:text-[62px]"
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
            <p className="mt-5 max-w-[380px] text-[15px] leading-[1.75] text-white/50 sm:text-[16px]">
              Inkly&apos;da maqola yozing, shaxsiy bloggingizni yarating va
              auditoriyangizni shakllantiring — bepul va hech qanday cheklovsiz.
            </p>

            {/* Tugmalar */}
            <div className="mt-8 flex flex-row items-center gap-3">
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
            <p className="mt-5 text-[13px] text-white/25">
              Ro&apos;yxatdan o&apos;tish bepul · Kredit karta talab etilmaydi
            </p>
          </div>

          {/* O'ng — mushuk */}
          <div className="relative hidden h-[480px] lg:flex lg:items-end lg:justify-center">
            <Image
              src="/cat.png"
              alt=""
              aria-hidden="true"
              width={560}
              height={480}
              className="select-none object-contain object-bottom"
              style={{ maxHeight: 480 }}
              priority
            />
          </div>

        </div>
      </Container>
    </section>
  )
}