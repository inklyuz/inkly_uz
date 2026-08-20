"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, PenLine, Settings, BookOpen,
  LogOut, ExternalLink, Send, Menu, X,
  Bell, ChevronLeft, User,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { LogoMark } from "@/components/ui/logo"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth/context"
import { cn } from "@/lib/utils"

// ─── Nav items ────────────────────────────────────────────────────────────────
const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/write", icon: PenLine, label: "Yozish" },
  { href: "/dashboard/posts", icon: BookOpen, label: "Maqolalarim" },
  // { href: "/telegram/account", icon: Send, label: "Telegram" },
  { href: "/settings/profile", icon: Settings, label: "Sozlamalar" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(href + "/")
}

// ─── NavLinks ─────────────────────────────────────────────────────────────────
function NavLinks({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string
  collapsed?: boolean
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
              collapsed && "justify-center px-2",
              active
                ? "bg-[#FFF3E8] text-[#FF6A00]"
                : "text-[#4B5563] hover:bg-[#F5F5F4] hover:text-[#141414]",
            )}
          >
            <Icon
              size={16}
              className={cn(
                "shrink-0 transition-colors duration-150",
                active ? "text-[#FF6A00]" : "text-[#9CA3AF] group-hover:text-[#4B5563]",
              )}
            />
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{label}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]" />}
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

// ─── ProfileDropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({
  user,
  onLogout,
}: {
  user: { full_name: string; username: string; avatar?: string }
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full ring-2 ring-transparent transition-all hover:ring-[#FF6A00]/30 focus:outline-none"
      >
        <Avatar src={user.avatar} name={user.full_name} size={32} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#EEEBE6] bg-white shadow-lg shadow-black/5">
          {/* User info */}
          <div className="border-b border-[#F0EDE8] px-4 py-3">
            <p className="truncate text-sm font-semibold text-[#141414]">{user.full_name}</p>
            <p className="truncate text-xs text-[#9CA3AF]">@{user.username}</p>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <Link
              href={`/@${user.username}`}
              target="_blank"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#4B5563] transition-colors hover:bg-[#F5F5F4] hover:text-[#141414]"
            >
              <User size={14} className="text-[#9CA3AF]" />
              Sahifam
              <ExternalLink size={11} className="ml-auto text-[#C4BEB8]" />
            </Link>
            <Link
              href="/settings/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#4B5563] transition-colors hover:bg-[#F5F5F4] hover:text-[#141414]"
            >
              <Settings size={14} className="text-[#9CA3AF]" />
              Sozlamalar
            </Link>
          </div>

          <div className="border-t border-[#F0EDE8] p-1.5">
            <button
              onClick={() => { setOpen(false); onLogout() }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              <LogOut size={14} />
              Chiqish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state, logout } = useAuth()
  const { user } = state
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Notification count — real data'ga ulashiladi
  const notifCount = 3

  const handleLogout = async () => {
    await logout()
    router.replace("/")
  }

  // ── Sidebar inner (shared desktop + mobile drawer) ──────────────────────────
  function SidebarInner({ mobile = false }: { mobile?: boolean }) {
    return (
      <>
        {/* Logo row */}
        <div className={cn(
          "flex h-14 shrink-0 items-center border-b border-[#EEEBE6]",
          collapsed && !mobile ? "justify-center px-3" : "justify-between px-4",
        )}>
          {(!collapsed || mobile) && (
            <Link
              href="/"
              className="flex items-center gap-2 text-[#141414]"
              onClick={mobile ? () => setMobileOpen(false) : undefined}
            >
              <LogoMark size={22} />
              <span className="text-base font-bold tracking-tighter">inkly</span>
            </Link>
          )}
          {collapsed && !mobile && (
            <Link href="/" className="text-[#141414]">
              <LogoMark size={22} />
            </Link>
          )}
          {mobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-1.5 text-[#9CA3AF] hover:bg-[#F5F5F4]"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Write CTA */}
        {/* <div className={cn("p-2", collapsed && !mobile && "px-2")}>
          <Link
            href="/write"
            onClick={mobile ? () => setMobileOpen(false) : undefined}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg bg-[#FF6A00] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E85F00]",
              collapsed && !mobile ? "px-0" : "px-4",
            )}
            title={collapsed && !mobile ? "Yangi maqola" : undefined}
          >
            <PenLine size={14} />
            {(!collapsed || mobile) && "Yangi maqola"}
          </Link>
        </div> */}

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <NavLinks
            pathname={pathname}
            collapsed={collapsed && !mobile}
            onNavigate={mobile ? () => setMobileOpen(false) : undefined}
          />
        </div>

        {/* User footer */}
        {user && (
          <div className="border-t border-[#F0EDE8] p-2">
            {collapsed && !mobile ? (
              <div className="flex justify-center py-1">
                <Avatar src={user.avatar} name={user.full_name} size={30} />
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                <Avatar src={user.avatar} name={user.full_name} size={30} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight text-[#141414]">
                    {user.full_name}
                  </p>
                  <p className="truncate text-xs leading-tight text-[#9CA3AF]">
                    @{user.username}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Chiqish"
                  className="rounded-md p-1.5 text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F7F6F3]">

      {/* ── Desktop Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen flex-col border-r border-[#EEEBE6] bg-white transition-all duration-200 lg:flex",
          collapsed ? "w-16" : "w-56",
        )}
      >
        <SidebarInner />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-[4.5rem] flex h-6 w-6 items-center justify-center rounded-full border border-[#EEEBE6] bg-white text-[#9CA3AF] shadow-sm transition-colors hover:border-[#FF6A00] hover:text-[#FF6A00]"
          title={collapsed ? "Kengaytirish" : "Yiqish"}
        >
          <ChevronLeft
            size={12}
            className={cn("transition-transform duration-200", collapsed && "rotate-180")}
          />
        </button>
      </aside>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
            <SidebarInner mobile />
          </aside>
        </div>
      )}

      {/* ── Main area ─────────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-[#EEEBE6] bg-white/90 px-4 backdrop-blur-md lg:px-5">

          {/* Left */}
          <div className="flex items-center gap-2">
            {/* Mobile: hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F5F5F4] lg:hidden"
              aria-label="Menyuni ochish"
            >
              <Menu size={20} />
            </button>

            {/* Mobile: Logo */}
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[#141414] lg:hidden"
            >
              <LogoMark size={20} />
              <span className="text-sm font-bold tracking-tighter">inkly</span>
            </Link>

            {/* Desktop: breadcrumb slot */}
            <div className="hidden lg:block" />
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5">

            {/* Write button */}
            <Link
              href="/write"
              className="flex items-center gap-1.5 rounded-lg bg-[#FF6A00] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#E85F00] lg:text-sm"
            >
              <PenLine size={13} />
              <span className="hidden sm:inline">Yangi maqola</span>
              <span className="sm:hidden">Yoz</span>
            </Link>

            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-[#F5F5F4] hover:text-[#141414]">
              <Bell size={18} />
              {notifCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6A00] text-[9px] font-bold text-white">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>

            {/* Profile dropdown */}
            {user && (
              <ProfileDropdown user={{ ...user, avatar: user.avatar ?? undefined }} onLogout={handleLogout} />
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}