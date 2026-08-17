"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, PenLine, Settings, BookOpen,
  LogOut, ChevronRight, ExternalLink,
} from "lucide-react"
import { LogoMark } from "@/components/ui/logo"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth/context"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard",          icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/write",              icon: PenLine,         label: "Yozish",       badge: "new" },
  { href: "/dashboard/posts",    icon: BookOpen,        label: "Maqolalarim"  },
  { href: "/settings/profile",   icon: Settings,        label: "Sozlamalar"   },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { state, logout } = useAuth()
  const { user } = state
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.replace("/")
  }

  return (
    <div className="flex min-h-screen bg-[#F2F4F7]">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-[#E8E3DD] bg-white lg:flex">

        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[#E8E3DD] px-5">
          <Link href="/" className="flex items-center gap-2 text-[#141414]">
            <LogoMark size={24} />
            <span className="text-lg font-bold tracking-tighter">inkly</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-[#FFF3E8] text-[#FF6A00]"
                    : "text-[#36565F] hover:bg-[#F2F4F7] hover:text-[#141414]",
                )}
              >
                <Icon size={17} className={active ? "text-[#FF6A00]" : "text-[#6B7280]"} />
                <span className="flex-1">{label}</span>
                {badge === "new" && (
                  <span className="rounded-full bg-[#FF6A00] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    NEW
                  </span>
                )}
              </Link>
            )
          })}

          {/* Sahifam */}
          {user && (
            <Link
              href={`/@${user.username}`}
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#36565F] transition-all hover:bg-[#F2F4F7] hover:text-[#141414]"
            >
              <ExternalLink size={17} className="text-[#6B7280]" />
              <span className="flex-1">Sahifam</span>
              <ChevronRight size={13} className="text-[#E8E3DD]" />
            </Link>
          )}
        </nav>

        {/* User footer */}
        {user && (
          <div className="border-t border-[#E8E3DD] p-3">
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
              <Avatar src={user.avatar} name={user.full_name} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#141414]">{user.full_name}</p>
                <p className="truncate text-xs text-[#6B7280]">@{user.username}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Chiqish"
                className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main area ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile topbar */}
        <header className="flex h-14 items-center justify-between border-b border-[#E8E3DD] bg-white px-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-[#141414]">
            <LogoMark size={22} />
            <span className="text-base font-bold tracking-tighter">inkly</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/write"
              className="flex items-center gap-1.5 rounded-full bg-[#FF6A00] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#E85F00]"
            >
              <PenLine size={12} /> Yozish
            </Link>
            {user && <Avatar src={user.avatar} name={user.full_name} size={30} />}
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="hidden h-14 items-center justify-between border-b border-[#E8E3DD] bg-white px-6 lg:flex">
          <div /> {/* breadcrumb uchun joy */}
          <div className="flex items-center gap-3">
            <Link
              href="/write"
              className="flex items-center gap-1.5 rounded-full bg-[#FF6A00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E85F00]"
            >
              <PenLine size={14} /> Yangi maqola
            </Link>
            {user && (
              <Link href={`/@${user.username}`} target="_blank">
                <Avatar src={user.avatar} name={user.full_name} size={32} />
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}