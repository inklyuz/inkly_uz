import Link from "next/link"
import { Send } from "lucide-react"

import { LogoMark } from "@/components/ui/logo"

const columns = [
  {
    title: "Platforma",
    links: [
      { href: "/", label: "Bosh sahifa" },
      { href: "/posts", label: "Maqolalar" },
      { href: "/creators", label: "Yozuvchilar" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Ma'lumot",
    links: [
      { href: "/about", label: "Haqida" },
      { href: "/faq", label: "Qoidalar" },
      { href: "/privacy", label: "Maxfiylik siyosati" },
      { href: "/contact", label: "Aloqa" },
    ],
  },
  {
    title: "Yordam",
    links: [
      { href: "/help", label: "Yordam markazi" },
      { href: "/faq", label: "Savol-javob" },
      { href: "/contact", label: "Bog'lanish" },
    ],
  },
]

function TelegramIcon() {
  return <Send size={16} strokeWidth={1.8} />
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.49 22H3.38l7.24-8.28L2.8 2h6.4l4.42 5.85L18.9 2Zm-1.1 17.86h1.73L8.3 4.04H6.45L17.8 19.86Z" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.4.58A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.58 9.4.58 9.4.58s7.55 0 9.4-.58a3 3 0 0 0 2.1-2.12A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.8V8.2l6.4 3.8-6.4 3.8Z" />
    </svg>
  )
}

const socialLinks = [
  {
    href: "https://t.me/inklyuz",
    label: "Telegram",
    icon: TelegramIcon,
  },
  {
    href: "#",
    label: "Instagram",
    icon: InstagramIcon,
  },
  {
    href: "#",
    label: "Twitter",
    icon: TwitterIcon,
  },
  {
    href: "#",
    label: "YouTube",
    icon: YoutubeIcon,
  },
]

export function Footer() {
  return (
    <footer className="border-t border-[#EDE9E3] bg-[#FFFDFC]">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-7 lg:px-8">

        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.25fr_2fr_1.2fr] lg:gap-16">

          <div className="max-w-[270px]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5"
            >
              <LogoMark />

              <span className="text-[25px] font-bold tracking-[-0.055em] text-[#171717]">
                inkly
              </span>
            </Link>

            <p className="mt-5 text-[13px] leading-[1.75] text-[#696661]">
              Yozuvchilar, fikr yurituvchilar va ijodkorlar
              uchun zamonaviy blog platformasi.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              {socialLinks.map((social) => {
                const Icon = social.icon

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#303030] transition-all duration-200 hover:bg-[#FFF0E7] hover:text-[#FF5A00]"
                  >
                    <Icon />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-8">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[12px] font-semibold text-[#171717]">
                  {column.title}
                </h3>

                <div className="mt-5 flex flex-col gap-3.5">
                  {column.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="w-fit text-[12px] text-[#68645F] transition-colors hover:text-[#FF5A00]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-[12px] font-semibold text-[#171717]">
              Yangiliklardan xabardor bo'ling
            </h3>

            <p className="mt-4 text-[12px] leading-[1.7] text-[#77736D]">
              Yangi maqolalar va imkoniyatlar haqida
              birinchilardan bo'lib biling.
            </p>

            <form className="mt-5 flex h-10 w-full overflow-hidden rounded-[9px] border border-[#E5E0D9] bg-white transition-colors focus-within:border-[#FF9A68]">
              <input
                type="email"
                placeholder="Email manzilingiz"
                aria-label="Email manzilingiz"
                className="min-w-0 flex-1 bg-transparent px-3.5 text-[11px] text-[#222] outline-none placeholder:text-[#A09C96]"
              />

              <button
                type="submit"
                aria-label="Obuna bo'lish"
                className="m-0.5 flex w-10 shrink-0 items-center justify-center rounded-[7px] bg-[#FF5A00] text-white transition-colors hover:bg-[#E95000]"
              >
                <Send size={15} strokeWidth={1.9} />
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#E9E5DF] py-6 text-[11px] text-[#77736D] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Inkly.
            Barcha huquqlar himoyalangan.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="transition-colors hover:text-[#FF5A00]"
            >
              Maxfiylik
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-[#FF5A00]"
            >
              Foydalanish shartlari
            </Link>

            <Link
              href="/"
              className="font-semibold tracking-[-0.02em] text-[#222]"
            >
              inkly.uz
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}