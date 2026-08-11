"use client"

import { motion, useReducedMotion } from "framer-motion"

export function HeroBackground() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">

      {/* ── bg.png — asosiy orqa fon rasmi + parallax animatsiya ────── */}
      <motion.div
        style={{
          position: "absolute",
          inset: "-5%",
          backgroundImage: "url('/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          opacity: 0.65,
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                scale: [1, 1.04, 1],
                x: [0, -12, 0],
                y: [0, -8, 0],
              }
        }
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ── Asosiy lime glow — matn va mockup o'rtasida, kattaligi katta ── */}
      <motion.div
        className="absolute left-1/2 top-[12%] -translate-x-1/2"
        style={{
          width: "900px",
          height: "700px",
          background:
            "radial-gradient(ellipse 60% 55% at 50% 40%, rgba(93,248,216,0.22) 0%, rgba(93,248,216,0.08) 50%, transparent 75%)",
          borderRadius: "50%",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }
        }
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Chap diagonal cold-blue shaklcha ─────────────────── */}
      <div
        style={{
          position: "absolute",
          left: "-140px",
          top: "160px",
          width: "520px",
          height: "420px",
          borderRadius: "60px",
          transform: "rotate(-14deg)",
          background:
            "linear-gradient(135deg, rgba(238,248,249,0.85) 0%, rgba(245,251,252,0.40) 50%, transparent 70%)",
          filter: "blur(28px)",
          opacity: 0.75,
        }}
      />

      {/* ── O'ng yuqori yengil glow ───────────────────────────────────── */}
      <motion.div
        style={{
          position: "absolute",
          right: "5%",
          top: "8%",
          width: "380px",
          height: "340px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(93,248,216,0.08) 0%, transparent 65%)",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : { x: [0, -25, 0], y: [0, 18, 0], opacity: [0.5, 0.8, 0.5] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* ── Dot grid — pastki chap ─────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-16 left-6 hidden h-40 w-40 lg:block"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(59,117,151,0.35) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.8 }}
      />

      {/* ── SVG dashed circle — o'ng yuqori ──────────────────────────── */}
      <motion.svg
        aria-hidden="true"
        className="absolute right-[19%] top-[7%] hidden h-16 w-16 lg:block"
        viewBox="0 0 100 100"
        fill="none"
        style={{ color: "rgba(111,209,215,0.55)" }}
        animate={
          prefersReducedMotion
            ? undefined
            : { rotate: 360, scale: [1, 1.18, 1] }
        }
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 3.8, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <circle
          cx="50"
          cy="50"
          r="35"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="5 7"
        />
      </motion.svg>

      {/* ── SVG curve — chap, sekin aylanadi ──────────────────────────── */}
      <motion.svg
        aria-hidden="true"
        className="absolute left-[12%] top-[30%] hidden h-24 w-24 lg:block"
        viewBox="0 0 100 100"
        fill="none"
        style={{ color: "rgba(111,209,215,0.42)" }}
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        <path
          d="M50 8 C 18 8, 8 30, 20 48 C 32 64, 62 58, 56 36"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </motion.svg>

      {/* ── SVG curve — o'ng pastki ───────────────────────────────────── */}
      <motion.svg
        aria-hidden="true"
        className="absolute right-[8%] top-[58%] hidden h-20 w-20 lg:block"
        viewBox="0 0 100 100"
        fill="none"
        style={{ color: "rgba(111,209,215,0.38)" }}
        animate={prefersReducedMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      >
        <path
          d="M50 10 C 76 15, 86 40, 64 56 C 48 66, 28 55, 34 40"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </motion.svg>

    </div>
  )
}