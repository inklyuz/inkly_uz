"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ArrowRight, Menu, PenLine, Sparkles, X } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/ui/logo"
import { useAuth } from "@/lib/auth/context"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

const links = [
  { href: "/posts",    label: "Maqolalar"    },
  { href: "/creators", label: "Mualliflar"   },
  { href: "/features", label: "Imkoniyatlar" },
  { href: "/pricing",  label: "Narxlar"      },
  { href: "/faq",      label: "FAQ"           },
]

export function Navbar() {
  const { state }         = useAuth()
  const { user, loading } = state
  const pathname          = usePathname()
  const [open, setOpen]   = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-900">
      <nav className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-1.5 text-white">
          <LogoMark />
          <span className="text-xl font-bold tracking-tighter">inkly</span>
        </Link>

        {/* ── Markaziy zona: announcement YOKI nav linklar ── */}
        {siteConfig.SHOW_ANNOUNCEMENT ? (
          <div className="relative hidden overflow-hidden rounded-full border border-lime-400/25 bg-white/5 px-5 py-1.5 lg:flex">
            {/* Shimmer */}
            <motion.div
              aria-hidden
              className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-lime-400/20 to-transparent"
              animate={{ x: ["-100%", "260%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 2,
              }}
            />
            <span className="relative flex items-center gap-2 text-sm font-medium text-white/90">
              <Sparkles size={13} className="shrink-0 text-lime-400" />
              Inkly tez kunda ishga tushadi —{" "}
              <button
                onClick={() =>
                  document
                    .getElementById("waitlist-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="font-semibold text-lime-400 underline underline-offset-2 transition-colors hover:text-lime-300"
              >
                username ni hoziroq band qiling
              </button>
              <Sparkles size={13} className="shrink-0 text-lime-400" />
            </span>
          </div>
        ) : (
          <div className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-white"
                    : "text-white/60 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* ── O'ng taraf ── */}
        <div className="flex items-center justify-end gap-3 sm:gap-4">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <>
              <Link href="/write" className="hidden sm:block">
                <Button variant="accent" size="sm" className="rounded-full">
                  <PenLine size={14} /> Yozish
                </Button>
              </Link>
              <Link href={`/@${user.username}`} aria-label="Profilim">
                <Avatar src={user.avatar} name={user.full_name} size={32} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-white/60 transition-colors hover:text-white sm:block"
              >
                Kirish
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="gap-1.5 rounded-full bg-lime-400 px-5 font-semibold text-ink-900 hover:bg-lime-300"
                >
                  Boshlash <ArrowRight size={14} />
                </Button>
              </Link>
            </>
          )}

          {/* Mobil menyu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menyu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ── Mobil menyu ── */}
      {open && (
        <div className="border-t border-white/10 bg-ink-900 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">

            {/* Announcement (mobil) */}
            {siteConfig.SHOW_ANNOUNCEMENT && (
              <div className="mb-3 rounded-xl border border-lime-400/20 bg-lime-400/10 px-4 py-3">
                <p className="text-sm font-medium text-white/80">
                  <Sparkles size={12} className="mr-1.5 inline text-lime-400" />
                  Inkly tez kunda ishga tushadi —{" "}
                  <button
                    onClick={() => {
                      setOpen(false)
                      setTimeout(
                        () =>
                          document
                            .getElementById("waitlist-section")
                            ?.scrollIntoView({ behavior: "smooth" }),
                        150,
                      )
                    }}
                    className="font-semibold text-lime-400 underline underline-offset-2"
                  >
                    username band qiling
                  </button>
                </p>
              </div>
            )}

            {/* Nav links */}
            {!siteConfig.SHOW_ANNOUNCEMENT &&
              links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              ))}

            {/* Kirish */}
            {!user && (
              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
                >
                  Kirish
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button
                    size="sm"
                    className="w-full gap-1.5 rounded-xl bg-lime-400 font-semibold text-ink-900 hover:bg-lime-300"
                  >
                    Boshlash <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}