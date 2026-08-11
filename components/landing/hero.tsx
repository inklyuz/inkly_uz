"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ChevronDown, Search, Bookmark } from "lucide-react"
import { HandleClaim } from "@/components/ui/handle-claim"
import { FloatingBadge } from "@/components/ui/floating-badge"
import { HeroBackground } from "@/components/landing/hero-background"

const IMG = {
  banner: "w=900&h=450&fit=crop&q=80",
  card: "w=400&h=520&fit=crop&q=80",
  avatar: "w=100&h=100&fit=crop&q=80",
} as const

const demoPosts = [
  {
    title: "Sun'iy intellekt davrida yozishning yangi usuli",
    author_name: "Diyorbek Abdumutalibov",
    read_minutes: 5,
    excerpt:
      "Bugun texnologiya hayotimizning ajralmas qismiga aylandi. Sun'iy intellekt esa yozish jarayonini yanada oson va samarali qilmoqda. Ammo baribir eng muhim narsa — bu inson fikri...",
    cover_image_url: `https://images.unsplash.com/photo-1517842645767-c639042777db?${IMG.banner}`,
  },
  {
    title: "Ijodkor sifatida auditoriya qanday yig'iladi",
    author_name: "Malika Yusupova",
    read_minutes: 4,
    excerpt:
      "Har qanday ijodkor yo'lining boshida bir xil savol tug'iladi: o'quvchilarni qanday topish mumkin? Bu maqolada real tajribalar asosida amaliy maslahatlar beramiz...",
    cover_image_url: `https://images.unsplash.com/photo-1499750310107-5fef28a66643?${IMG.banner}`,
  },
  {
    title: "Har kuni yozish odatini qanday shakllantirish mumkin",
    author_name: "Aziz Karimov",
    read_minutes: 6,
    excerpt:
      "Muntazamlik — har qanday ijodkorning eng katta ustunligi. Kichik qadamlardan boshlab, katta natijalarga erishish mumkin. Mana shu yo'lda yordam beradigan usullar...",
    cover_image_url: `https://images.unsplash.com/photo-1455390582262-044cdead277a?${IMG.banner}`,
  },
]

function getDemoPost() {
  return demoPosts[Math.floor(Math.random() * demoPosts.length)]
}

const sideCards = [
  {
    title: "Sodda odatlar, katta natijalar",
    date: "8 avgust, 2026",
    read: "4 min o'qish",
    image: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?${IMG.card}`,
    rotate: -6,
    position: "-left-40",
  },
  {
    title: "Sayohat meni nimalarga o'rgatdi",
    date: "7 avgust, 2026",
    read: "5 min o'qish",
    image: `https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?${IMG.card}`,
    rotate: 6,
    position: "-right-40",
  },
]

const avatars = [
  `https://images.unsplash.com/photo-1633332755192-727a05c4013d?${IMG.avatar}`,
  `https://images.unsplash.com/photo-1494790108377-be9c29b29330?${IMG.avatar}`,
  `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?${IMG.avatar}`,
  `https://images.unsplash.com/photo-1531123897727-8f129e1688ce?${IMG.avatar}`,
]

/* ── Animatsiya variantlari ──────────────────────────────────────── */
const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const fadeSlideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
}

const noAnimation = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
}

export function Hero() {
  const featured = getDemoPost()
  const prefersReduced = useReducedMotion()

  const container = prefersReduced ? noAnimation : staggerContainer
  const item = prefersReduced ? noAnimation : fadeSlideUp

  return (
    <section className="relative overflow-x-hidden bg-cream-50 px-4 pt-16 pb-24 sm:px-6 sm:pt-20 sm:pb-32">
      <HeroBackground />


      {/* ── Matn qismi — staggered fade-in + slide-up ────────────── */}
      <motion.div
        className="relative z-10 mx-auto max-w-3xl text-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={item}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-900"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
          O&apos;zbekistonlik mualliflar uchun
        </motion.div>

        <motion.h1
          variants={item}
          className="text-5xl font-extrabold leading-[1.05] tracking-tight text-balance text-ink-900 sm:text-7xl"
        >
          Yozing. Nashr qiling.
          <br />
          O&apos;zingizni <span className="text-lime-500">ifoda eting.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-ink-600"
        >
          Maqola, blog va g&apos;oyalaringizni bitta zamonaviy platformada yarating, nashr qiling va
          auditoriyangiz bilan ulashing.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex justify-center">
          <HandleClaim className="w-full max-w-md" />
        </motion.div>

        <motion.div variants={item} className="mt-4 flex flex-col items-center gap-0">
          <ChevronDown size={20} className="text-ink-400" strokeWidth={2.5} />
          <ChevronDown size={20} className="-mt-2 text-ink-300" strokeWidth={2.5} />
          <span className="mt-2 text-xs text-ink-400">
            Bepul boshlang. Bir necha daqiqada o&apos;z sahifangizga ega bo&apos;ling.
          </span>
        </motion.div>
      </motion.div>

      {/* ── Desktop mockup ───────────────────────────────────────── */}
      <div className="relative z-10 mx-auto mt-20 hidden max-w-xl lg:block">

        {sideCards.map((card, i) => (
          <motion.div
            key={card.title}
            aria-hidden
            initial={prefersReduced ? false : { opacity: 0, x: i === 0 ? -70 : 70, rotate: card.rotate * 2 }}
            animate={{ opacity: 1, x: 0, rotate: card.rotate }}
            transition={{ type: "spring", stiffness: 70, damping: 16, delay: 0.7 + i * 0.15 }}
            className={`absolute ${card.position} top-40 z-20 w-72 overflow-hidden rounded-2xl border border-cream-300 bg-white p-3 shadow-xl`}
          >
            <div className="aspect-[8/5] w-full overflow-hidden rounded-lg bg-cream-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.image} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="mt-2 text-sm font-semibold leading-snug text-ink-900">{card.title}</p>
            <p className="mt-1 text-xs text-ink-400">{card.date} · {card.read}</p>
          </motion.div>
        ))}

        {/* Badges — side carddan TASHQARIDA, chap */}
        <FloatingBadge className="-left-[305px] top-15" icon="heart" label="128" sub="Yoqdi" entranceDelay={0.8} floatDuration={3.2} floatOffset={6} />
        <FloatingBadge className="-left-[312px] top-59" icon="users" label="2.4K" sub="O'quvchilar" href="/creators" entranceDelay={1.0} floatDuration={3.8} floatOffset={9} />
        <FloatingBadge className="-left-[305px] top-95" icon="clock" label="5 min" sub="O'qish vaqti" entranceDelay={1.2} floatDuration={3.5} floatOffset={7} />

        {/* Badges — side carddan TASHQARIDA, o'ng */}
        <FloatingBadge className="-right-[305px] top-15" icon="trending" label="+2.4K" sub="O'qildi" entranceDelay={0.9} floatDuration={3.4} floatOffset={7} />
        <FloatingBadge className="-right-[312px] top-59" icon="share" label="Ulashish" entranceDelay={1.1} floatDuration={4.0} floatOffset={8} />
        <FloatingBadge className="-right-[305px] top-95" icon="pen" label="Yangi maqola" href="/write" entranceDelay={1.3} floatDuration={3.6} floatOffset={6} />

        {/* Markaziy mockup */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.5 }}
          className="relative z-20 mx-auto overflow-hidden rounded-3xl border border-cream-300 bg-white shadow-2xl shadow-ink-900/10"
        >
          <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
            <span className="flex items-center gap-1.5 text-lg font-bold text-ink-900">
              <span className="h-2 w-2 rounded-full bg-lime-400" />
              inkly
            </span>
            <div className="flex items-center gap-4 text-ink-400">
              <Search size={18} />
              <Bookmark size={18} />
              <div className="h-7 w-7 overflow-hidden rounded-full bg-cream-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatars[0]} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <h3 className="text-xl font-bold leading-snug text-ink-900">{featured.title}</h3>
            <div className="mt-3 flex items-center gap-2 text-sm text-ink-400">
              <span className="h-6 w-6 overflow-hidden rounded-full bg-cream-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatars[0]} alt="" className="h-full w-full object-cover" />
              </span>
              {featured.author_name}
              <span>·</span>
              {featured.read_minutes} min o&apos;qish
            </div>

            <div className="mt-4 aspect-[2/1] w-full overflow-hidden rounded-xl bg-cream-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured.cover_image_url} alt="" className="h-full w-full object-cover" />
            </div>

            {/* <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink-600">{featured.excerpt}</p> */}
          </div>

          <div className="flex items-center justify-between border-t border-cream-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {avatars.map((src) => (
                  <span key={src} className="h-7 w-7 overflow-hidden rounded-full border-2 border-white bg-cream-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </span>
                ))}
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm font-bold text-ink-900">10K+</p>
                <p className="text-xs text-ink-400">Mualliflar biz bilan</p>
              </div>
            </div>
            <div className="text-right leading-tight">
              <p className="flex items-center gap-1 text-sm font-bold text-ink-900">
                <span className="text-lime-500">★</span> 4.9 / 5
              </p>
              <p className="text-xs text-ink-400">Foydalanuvchilar bahosi</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Mobil mockup ─────────────────────────────────────────── */}
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.5 }}
        className="relative z-10 mx-auto mt-16 max-w-xl lg:hidden"
      >
        <div className="overflow-hidden rounded-3xl border border-cream-300 bg-white shadow-2xl shadow-ink-900/10">
          <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
            <span className="flex items-center gap-1.5 text-lg font-bold text-ink-900">
              <span className="h-2 w-2 rounded-full bg-lime-400" />
              inkly
            </span>
            <div className="h-7 w-7 rounded-full bg-cream-200" />
          </div>
          <div className="px-6 py-5">
            <h3 className="text-xl font-bold leading-snug text-ink-900">{featured.title}</h3>
            <div className="mt-3 flex items-center gap-2 text-sm text-ink-400">
              <span className="h-6 w-6 rounded-full bg-cream-200" />
              {featured.author_name} · {featured.read_minutes} min o&apos;qish
            </div>
            <div className="mt-4 aspect-[2/1] w-full overflow-hidden rounded-xl bg-cream-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured.cover_image_url} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}