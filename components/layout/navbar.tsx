"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ArrowRight, Menu, PenLine, Sparkles, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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

// Animation variants
const menuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
      when: "afterChildren",
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      when: "beforeChildren",
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  closed: { opacity: 0, x: -10 },
  open:   { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
}

const iconVariants = {
  closed: { rotate: 0,   scale: 1 },
  open:   { rotate: 90,  scale: 1 },
}

export function Navbar() {
  const { state }         = useAuth()
  const { user, loading } = state
  const pathname          = usePathname()
  const [open, setOpen]   = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-900/95 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-1.5 text-white">
            <LogoMark />
            <span className="text-xl font-bold tracking-tighter">inkly</span>
          </Link>

          {/* ── Markaziy zona ── */}
          {siteConfig.SHOW_ANNOUNCEMENT ? (
            <div className="relative hidden overflow-hidden rounded-full border border-lime-400/25 bg-white/5 px-5 py-1.5 lg:flex">
              <motion.div
                aria-hidden
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-lime-400/20 to-transparent"
                animate={{ x: ["-100%", "260%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              />
              <span className="relative flex items-center gap-2 text-sm font-medium text-white/90">
                <Sparkles size={13} className="shrink-0 text-lime-400" />
                Inkly tez kunda ishga tushadi —{" "}
                <button
                  onClick={() =>
                    document.getElementById("waitlist-section")?.scrollIntoView({ behavior: "smooth" })
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
                    pathname === link.href ? "text-white" : "text-white/60 hover:text-white",
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
            <motion.button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Menyu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                variants={iconVariants}
                animate={open ? "open" : "closed"}
                transition={{ duration: 0.2 }}
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </motion.div>
            </motion.button>
          </div>
        </nav>

        {/* ── Mobil menyu ── */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="mobile-menu"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="overflow-hidden border-t border-white/10 bg-ink-900 lg:hidden"
            >
              <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">

                {/* Announcement (mobil) */}
                {siteConfig.SHOW_ANNOUNCEMENT && (
                  <motion.div
                    variants={itemVariants}
                    className="mb-3 rounded-xl border border-lime-400/20 bg-lime-400/10 px-4 py-3"
                  >
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
                  </motion.div>
                )}

                {/* Nav links */}
                {!siteConfig.SHOW_ANNOUNCEMENT &&
                  links.map((link) => (
                    <motion.div key={link.href} variants={itemVariants}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                          pathname === link.href
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                {/* User: logged in */}
                {user && (
                  <motion.div
                    variants={itemVariants}
                    className="mt-2 border-t border-white/10 pt-3"
                  >
                    <Link href="/write" onClick={() => setOpen(false)}>
                      <Button
                        size="sm"
                        className="w-full gap-2 rounded-xl bg-white/10 font-medium text-white hover:bg-white/15"
                      >
                        <PenLine size={14} /> Yozish
                      </Button>
                    </Link>
                  </motion.div>
                )}

                {/* User: logged out */}
                {!user && (
                  <motion.div
                    variants={itemVariants}
                    className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3"
                  >
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-3 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
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
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Backdrop overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}