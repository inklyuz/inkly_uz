"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronDown, Menu, PenLine, Search, X } from "lucide-react"
import { AnimatePresence, motion, type Variants } from "framer-motion"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/context"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/posts", label: "Maqolalar" },
  // { href: "/creators", label: "Yozuvchilar" },
  // { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "Haqida" },
]

const menuVariants: Variants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const itemVariants: Variants = {
  closed: {
    opacity: 0,
    y: -8,
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
}

export function Navbar() {
  const { state } = useAuth()
  const { user, loading } = state
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[100] w-full transition-all duration-300",
        scrolled
          ? "border-b border-[#E8E3DD]/80 bg-[#FFFDFC]/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-[76px] w-full max-w-[1400px] items-center px-6 sm:px-8 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/header.png"
            alt="Inkly"
            width={110}
            height={36}
            priority
            className="h-9 w-auto object-contain"
          />
        </Link>

        <nav className="ml-[88px] hidden h-full items-center gap-[36px] lg:flex">
          {links.map((link) => {
            const active = isActive(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex h-full items-center text-[13px] font-medium tracking-[-0.01em] transition-colors",
                  active
                    ? "text-[#FF5A00]"
                    : "text-[#1C1C1C] hover:text-[#FF5A00]"
                )}
              >
                {link.label}

                {active && (
                  <span className="absolute bottom-[11px] left-0 right-0 h-[2px] rounded-full bg-[#FF5A00]" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <Link
            href="/search"
            aria-label="Qidirish"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#252525] transition-colors hover:bg-[#FFF3E8] hover:text-[#FF5A00]"
          >
            <Search size={20} strokeWidth={1.8} />
          </Link>

          {loading ? (
            <div className="h-9 w-[130px] animate-pulse rounded-full bg-[#F1EEEA]" />
          ) : user ? (
            <>
              <Link href="/write">
                <Button className="h-[38px] gap-2 rounded-[9px] bg-[#FF5A00] px-[15px] text-[12px] font-semibold text-white shadow-none hover:bg-[#E95000]">
                  <PenLine size={14} strokeWidth={1.9} />
                  Maqola yozish
                </Button>
              </Link>

              <Link
                href={`/@${user.username}`}
                className="group flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-[#FFF3E8]"
              >
                <Avatar
                  src={user.avatar}
                  name={user.full_name}
                  size={32}
                />

                <span className="max-w-[145px] truncate text-[12px] font-medium text-[#252525]">
                  inkly.uz/@{user.username}
                </span>

                <ChevronDown
                  size={15}
                  strokeWidth={1.8}
                  className="shrink-0 text-[#444]"
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[13px] font-medium text-[#252525] transition-colors hover:text-[#FF5A00]"
              >
                Kirish
              </Link>

              <Link href="/register">
                <Button className="h-[38px] rounded-[9px] bg-[#FF5A00] px-4 text-[12px] font-semibold text-white shadow-none hover:bg-[#E95000]">
                  Boshlash
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          {user && (
            <Link href={`/@${user.username}`} aria-label="Profilim">
              <Avatar
                src={user.avatar}
                name={user.full_name}
                size={32}
              />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navbar"
            aria-label="Menyu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#222] transition-colors hover:bg-[#FFF3E8] hover:text-[#FF5A00]"
          >
            {open ? (
              <X size={20} strokeWidth={1.8} />
            ) : (
              <Menu size={20} strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-navbar"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="overflow-hidden border-t border-[#F0ECE7] bg-[#FFFDFC]/95 backdrop-blur-md lg:hidden"
          >
            <nav className="mx-auto flex max-w-[1400px] flex-col px-6 py-4 sm:px-8">
              {links.map((link) => {
                const active = isActive(link.href)

                return (
                  <motion.div
                    key={link.href}
                    variants={itemVariants}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-[14px] font-medium transition-colors",
                        active
                          ? "bg-[#FFF3E8] text-[#FF5A00]"
                          : "text-[#222] hover:bg-[#FFF8F0]"
                      )}
                    >
                      {link.label}

                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A00]" />
                      )}
                    </Link>
                  </motion.div>
                )
              })}

              {user && (
                <motion.div
                  variants={itemVariants}
                  className="mt-3 border-t border-[#F0ECE7] pt-3"
                >
                  <Link
                    href="/write"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#FF5A00] px-4 py-3 text-[13px] font-semibold text-white hover:bg-[#E95000]"
                  >
                    <PenLine size={15} />
                    Maqola yozish
                  </Link>
                </motion.div>
              )}

              {!user && !loading && (
                <motion.div
                  variants={itemVariants}
                  className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F0ECE7] pt-3"
                >
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-[#E8E3DD] px-4 py-3 text-[13px] font-medium text-[#222]"
                  >
                    Kirish
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-[#FF5A00] px-4 py-3 text-[13px] font-semibold text-white"
                  >
                    Boshlash
                  </Link>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}