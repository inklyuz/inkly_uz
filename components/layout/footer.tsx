import Link from "next/link"
import { LogoMark } from "@/components/ui/logo"
import { Send } from "lucide-react"

const columns = [
  {
    title: "Platforma",
    links: [
      { href: "/posts",      label: "Maqolalar"     },
      { href: "/categories", label: "Kategoriyalar" },
      { href: "/creators",   label: "Ijodkorlar"    },
      { href: "/features",   label: "Imkoniyatlar"  },
    ],
  },
  {
    title: "Hisob",
    links: [
      { href: "/login",           label: "Kirish"              },
      { href: "/register",        label: "Ro'yxatdan o'tish"   },
      { href: "/forgot-password", label: "Parolni tiklash"     },
    ],
  },
  {
    title: "Kompaniya",
    links: [
      { href: "/about",   label: "Biz haqimizda" },
      { href: "/pricing", label: "Narxlar"        },
      { href: "/faq",     label: "FAQ"             },
      { href: "/contact", label: "Aloqa"           },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-900">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">

        {/* Top row */}
        <div className="flex flex-col gap-12 sm:flex-row sm:justify-between">

          {/* Brand */}
          <div className="max-w-[220px]">
            <Link href="/" className="flex items-center gap-1.5 text-white">
              <LogoMark />
              <span className="text-xl font-bold tracking-tighter">inkly</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              O&apos;zbek tilida yozadigan ijodkorlar uchun nashriyot platformasi.
            </p>

            {/* Telegram CTA */}
            <a
              href="https://t.me/inklyuz"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Send size={12} className="text-ink-400" />
              Telegram kanalimiz
            </a>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-10 sm:gap-14">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
                  {column.title}
                </p>
                {column.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Inkly. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white/60">
              Maxfiylik siyosati
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white/60">
              Foydalanish shartlari
            </Link>
            <span className="text-lime-400/60">inkly.uz</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
