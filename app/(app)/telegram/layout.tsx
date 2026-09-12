"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const telegramNavItems = [
  { href: "/telegram/account", label: "Akkaunt" },
  { href: "/telegram/channels", label: "Kanallar" },
  { href: "/telegram/verify", label: "Tasdiqlash" },
] as const

// Har bir nav item uchun ikonlar
function NavIcon({ label, active }: { label: string; active: boolean }) {
  const cls = active ? "text-primary" : "text-text-muted"

  if (label === "Akkaunt")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )

  if (label === "Kanallar")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="20" y2="22" />
        <line x1="12" y1="15" x2="12" y2="22" />
      </svg>
    )

  // Tasdiqlash
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

export default function TelegramLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:px-8">
      {/* ── Sticky tab navigation ─────────────────────────────────────────── */}
      <nav
        className="mb-6 flex items-center gap-1 rounded-2xl border border-border-default bg-white p-1.5"
        role="tablist"
        aria-label="Telegram bo'limlari"
      >
        {telegramNavItems.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              role="tab"
              aria-selected={active}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-inkly-orange-light text-primary shadow-sm"
                  : "text-text-secondary hover:bg-bg-muted hover:text-text-primary",
              )}
            >
              <NavIcon label={label} active={active} />
              <span className="hidden sm:inline">{label}</span>
              {/* Mobile: faqat ikon ko'rinadi, screen-reader uchun matn */}
              <span className="sr-only sm:hidden">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      {children}
    </div>
  )
}