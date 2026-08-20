"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { ArrowDown, Check, ChevronDown } from "lucide-react"
import { HandleClaim } from "@/components/ui/handle-claim"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const bounceDown: Variants = {
  initial: { y: 0, opacity: 0.4 },
  animate: { y: 6, opacity: 1, transition: { duration: 0.7, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } },
}

export function Hero() {
  const reducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const initial = !mounted || reducedMotion ? "visible" : "hidden"

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative isolate overflow-hidden border-b border-[#E8E3DD] bg-white min-h-screen">

      {/* BACKGROUND BANNER — faqat lg+ da */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-none bg-no-repeat bg-[position:center_center] lg:bg-[url('/images/bg-banner.png')] lg:bg-[size:auto_100%] xl:bg-[size:cover]" />
      </div>

      {/* SOFT OVERLAY — faqat lg+ da */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[5] lg:bg-gradient-to-r lg:from-white/95 lg:via-white/40 lg:to-transparent" />

      {/* CONTENT */}
      <div className="relative mx-auto flex min-h-screen max-w-[1280px] items-center px-5 pb-16 pt-0 sm:px-7 sm:pb-20 lg:px-8 lg:pb-24">
        <motion.div
          className="relative z-10 w-full max-w-[580px] lg:max-w-[620px]"
          variants={container}
          initial={initial}
          animate="visible"
        >
          {/* BADGE */}
          <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/25 bg-white/85 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FF6A00] shadow-sm backdrop-blur-sm sm:mb-6 sm:text-[11px]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6A00]" />
            O&apos;zbekistonlik mualliflar uchun
          </motion.div>

          {/* TITLE */}
          <motion.h1 id="hero-title" variants={fadeUp} className="text-[38px] font-extrabold leading-[0.94] tracking-[-0.05em] text-[#151515] sm:text-[56px] lg:text-[80px] xl:text-[90px]">
            Yozing.
            <br />
            Nashr qiling.
            <br />
            O&apos;zingizni{" "}
            <span className="text-[#FF6A00]">ifoda eting.</span>
          </motion.h1>

          {/* DESCRIPTION */}
          <motion.p variants={fadeUp} className="mt-4 max-w-[480px] text-[14px] leading-[1.65] text-[#4F555B] sm:mt-7 sm:text-[17px]">
            Maqola, blog va g&apos;oyalaringizni bitta zamonaviy platformada yarating, nashr qiling va auditoriyangiz bilan ulashing.
          </motion.p>

          {/* USERNAME CLAIM */}
          <motion.div variants={fadeUp} className="mt-5 w-full max-w-[500px] sm:mt-8">
            <HandleClaim className="w-full" />
          </motion.div>

          {/* TRUST */}
          <motion.div variants={fadeUp} className="mt-3 flex items-center gap-2 text-[11px] leading-5 text-[#77736D] sm:mt-4">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <Check size={11} strokeWidth={2.5} className="text-[#FF6A00]" />
            </span>
            <span>Bepul boshlang. Bir necha daqiqada o&apos;z sahifangizga ega bo&apos;ling.</span>
          </motion.div>

          {/* MINI BENEFITS */}
          <motion.div variants={fadeUp} className="mt-4 flex items-center gap-3 text-[10px] text-[#77736D] sm:mt-5 sm:gap-4 sm:text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]" />
              Shaxsiy sahifa
            </span>
            <span className="h-3 w-px bg-[#D9D2C9]" />
            <span>Bepul boshlash</span>
            <span className="h-3 w-px bg-[#D9D2C9]" />
            <span>Oson nashr</span>
          </motion.div>
        </motion.div>
      </div>

      {/* SCROLL INDICATOR */}
      <motion.div aria-hidden="true" className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center lg:flex">
        <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#8A867F]">Pastga</span>
        <motion.div variants={bounceDown} initial="initial" animate={reducedMotion ? "initial" : "animate"} className="mt-2 flex flex-col items-center">
          <ChevronDown size={25} className="text-red" strokeWidth={2} />
          <ChevronDown size={25} className="-mt-2.5 text-red/40" strokeWidth={2} />
        </motion.div>
      </motion.div>
    </section>
  )
}