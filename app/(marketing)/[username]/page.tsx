import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  Bell,
  Bookmark,
  Calendar,
  ChevronDown,
  Copy,
  Eye,
  Globe,
  Heart,
  Mail,
  MapPin,
  Menu,
  MoreHorizontal,
  PenLine,
  Search,
  Send,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react"

import {
  Github,
  Twitter,
} from "@/components/ui/brand-icons"

import { Avatar } from "@/components/ui/avatar"
import { VerifiedDot } from "@/components/ui/badge"

import type { SocialLinks, PostListItem } from "@/types/api"
import { getUserSafe } from "@/lib/api/users"
import { listPostsSafe } from "@/lib/api/posts"
import { formatDate } from "@/lib/utils/format"

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function ProfilePage({
  params,
}: ProfilePageProps) {

  const { username: rawUsername } = await params
  const username = decodeURIComponent(rawUsername).replace(/^@/, "")

  // Fayl kengaytmali yoki tizim yo'llari — darhol 404
  if (/\.[a-zA-Z0-9]{1,5}$/.test(username) || username.startsWith("_")) {
    notFound()
  }

  const user =
    (await getUserSafe(username)) ??
    (await getUserSafe(`@${username}`))

  if (!user) notFound()
  const postsData = await listPostsSafe({
    author: user.username,
    page_size: 12,
  })

  const articleCount = postsData.total

  return (
    <main className="min-h-screen bg-white pt-[76px]">
      {/* =========================================================
          PAGE
      ========================================================= */}

      <div className="mx-auto w-full max-w-[1240px] px-5 pb-10 sm:px-7 lg:px-8">

        {/* Breadcrumb */}

        <div className="flex h-[58px] items-center gap-2 text-[12px] text-[#77736C]">
          <Link
            href="/"
            className="transition hover:text-[#FF6A00]"
          >
            Bosh sahifa
          </Link>

          <span className="text-[#B2ADA5]">›</span>

          <span className="text-[#77736C]">
            @{user.username}
          </span>
        </div>

        {/* =======================================================
            PROFILE HERO
        ======================================================== */}

        <section className="relative min-h-[274px] overflow-hidden rounded-[19px] border border-[#E8E3DD] bg-white">

          <div className="relative z-10 flex min-h-[274px] items-center px-7 py-8 sm:px-10 lg:px-11">

            {/* Avatar */}

            <div className="relative shrink-0">
              <div className="rounded-full border-[5px] border-white bg-white p-0.5 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
                <Avatar
                  src={user.avatar}
                  name={user.full_name}
                  size={136}
                />
              </div>

              <span className="absolute bottom-[7px] right-[7px] h-[20px] w-[20px] rounded-full border-[3px] border-white bg-[#28B957]" />
            </div>

            {/* User info */}

            <div className="ml-7 min-w-0 max-w-[610px]">
              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-[32px] font-bold tracking-[-0.04em] text-[#101820] sm:text-[35px]">
                  @{user.username}
                </h1>

              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-semibold text-[#151515]">
                  {user.full_name}
                </span>

                <span className="rounded-[6px] border border-[#FFB891] bg-[#FFF3E8] px-2.5 py-1 text-[11px] font-semibold text-[#FF6A00]">
                  Yozuvchi
                </span>

                {user.is_verified && (
                  <VerifiedDot />
                )}
              </div>

              <p className="mt-4 max-w-[610px] text-[14px] leading-[1.7] text-[#343A40]">
                {user.bio || "Haqida ma'lumot kiritilmagan."}
              </p>

              {/* Social buttons */}

              <div className="mt-4 flex items-center gap-2">
                {user.socials?.telegram && (
                  <SocialButton
                    href={`https://t.me/${user.socials.telegram}`}
                    label="Telegram"
                  >
                    <Send size={17} />
                  </SocialButton>
                )}

                {user.socials?.github && (
                  <SocialButton
                    href={`https://github.com/${user.socials.github}`}
                    label="GitHub"
                  >
                    <Github size={17} />
                  </SocialButton>
                )}

                {user.socials?.twitter && (
                  <SocialButton
                    href={`https://twitter.com/${user.socials.twitter}`}
                    label="Twitter"
                  >
                    <Twitter size={17} />
                  </SocialButton>
                )}
              </div>
            </div>

            {/* Decorative Inkly symbol */}

            <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block">
              <div className="relative flex h-[190px] w-[190px] items-center justify-center">
                <div className="absolute h-[125px] w-[125px] rotate-[12deg] rounded-[25%] bg-[#FF6A00] opacity-95 [clip-path:polygon(45%_0%,55%_0%,61%_30%,82%_10%,89%_18%,70%_39%,100%_45%,100%_55%,70%_61%,89%_82%,82%_89%,61%_70%,55%_100%,45%_100%,39%_70%,18%_89%,10%_82%,30%_61%,0%_55%,0%_45%,30%_39%,10%_18%,18%_10%,39%_30%)]" />
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            PROFILE TABS
        ======================================================== */}

        <section className="mt-[14px] rounded-[18px] border border-[#EEE7DE] bg-white">

          <div className="flex min-h-[54px] items-center justify-between border-b border-[#EEE9E3] px-4 sm:px-5">

            <nav className="flex h-full items-center gap-6 overflow-x-auto">

              <ProfileTab
                href="#articles"
                active
                icon={<Bookmark size={17} strokeWidth={1.8} />}
              >
                Maqolalar
              </ProfileTab>

              <ProfileTab
                href="#about"
                icon={<UserRound size={17} strokeWidth={1.8} />}
              >
                Haqida
              </ProfileTab>
            </nav>

            <div className="ml-4 hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href)
                  } catch {
                    /* ignore */
                  }
                }}
                aria-label="Havolani nusxalash"
                className="flex h-[34px] w-[38px] items-center justify-center rounded-[8px] border border-[#E6E1DB] bg-white text-[#333] transition hover:bg-[#FFF3E8]"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* =====================================================
              CONTENT GRID
          ====================================================== */}

          <div
            id="articles"
            className="grid gap-6 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_300px]"
          >

            {/* LEFT */}

            <div className="min-w-0">

              {/* Sort */}

              <div className="mb-3 flex items-center justify-between">
                <div />

                <button
                  type="button"
                  className="flex h-[34px] items-center gap-2 rounded-[8px] border border-[#E4DED7] bg-white px-3 text-[11px] font-medium text-[#252525]"
                >
                  So‘nggi
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Posts */}

              {postsData.items.length === 0 ? (
                <EmptyArticles />
              ) : (
                <div className="space-y-3">

                  {postsData.items.map((post) => (
                    <ProfilePostCard
                      key={post.uuid}
                      post={post}
                    />
                  ))}

                </div>
              )}
            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================== */}

            <aside className="space-y-4">

              {/* About */}

              <div
                id="about"
                className="rounded-[14px] border border-[#EEE7DE] bg-white p-4"
              >
                <div className="flex items-center gap-2">
                  <UserRound
                    size={18}
                    strokeWidth={1.8}
                    className="text-[#343A40]"
                  />

                  <h3 className="text-[14px] font-bold text-[#202020]">
                    Muallif haqida
                  </h3>
                </div>

                <div className="mt-4 space-y-2.5 text-[11px] text-[#3E4247]">

                  <p>
                    <span className="font-semibold">Ism:</span>{" "}
                    {user.full_name}
                  </p>

                  {user.location && (
                    <p>
                      <span className="font-semibold">
                        Lokatsiya:
                      </span>{" "}
                      {user.location}
                    </p>
                  )}

                  {user.created_at && (
                    <p>
                      <span className="font-semibold">
                        Qo‘shilgan sana:
                      </span>{" "}
                      {formatDate(user.created_at)}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats - Real data only (article count from API) */}

              <div className="grid grid-cols-3 overflow-hidden rounded-[14px] border border-[#EEE7DE] bg-white">

                <MiniStat
                  value={articleCount}
                  label="Maqolalar"
                />

                <MiniStat
                  value={postsData.items.reduce((sum, p) => sum + (p.views_count ?? 0), 0)}
                  label="O‘qishlar"
                  bordered
                />

                <MiniStat
                  value={postsData.items.reduce((sum, p) => sum + (p.likes_count ?? 0), 0)}
                  label="Yoqtirilganlar"
                  bordered
                />

              </div>

              {/* Categories */}

              <CategoriesSidebar />

              {/* Popular */}

              <PopularPosts posts={postsData.items.slice(0, 3)} />

            </aside>
          </div>
        </section>

      </div>
    </main>
  )
}


/* ================================================================
   SOCIAL BUTTON
================================================================ */

function SocialButton({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#E7DFD6] bg-white/80 text-[#252B31] transition hover:border-[#FFB58F] hover:bg-white hover:text-[#FF6A00]"
    >
      {children}
    </a>
  )
}

/* ================================================================
   PROFILE TAB
================================================================ */

function ProfileTab({
  href,
  children,
  icon,
  active = false,
}: {
  href: string
  children: React.ReactNode
  icon: React.ReactNode
  active?: boolean
}) {
  return (
    <a
      href={href}
      className={[
        "relative flex h-[54px] shrink-0 items-center gap-2 text-[11px] font-medium transition",
        active
          ? "font-semibold text-[#FF6A00]"
          : "text-[#525960] hover:text-[#FF6A00]",
      ].join(" ")}
    >
      {icon}
      {children}

      {active && (
        <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-[#FF6A00]" />
      )}
    </a>
  )
}

/* ================================================================
   POST CARD
================================================================ */

function ProfilePostCard({
  post,
}: {
  post: PostListItem
}) {
  const postUrl = `/@${post.author.username}/${post.slug}`

  return (
    <Link
      href={postUrl}
      className="group flex min-h-[139px] gap-4 rounded-[10px] border border-[#EEE7DE] bg-white p-3 transition hover:border-[#E5D4C6] hover:shadow-[0_5px_20px_rgba(0,0,0,0.035)]"
    >

      {/* Image */}

      <div className="relative h-[113px] w-[180px] shrink-0 overflow-hidden rounded-[7px] bg-[#F2EEE9] sm:w-[210px]">

        {post.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover}
            alt={post.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#F5F0E9]">
            <PenLine
              size={24}
              className="text-[#C4BDB3]"
            />
          </div>
        )}
      </div>

      {/* Content */}

      <div className="flex min-w-0 flex-1 flex-col py-1">

        <h3 className="line-clamp-2 text-[17px] font-bold leading-[1.35] tracking-[-0.025em] text-[#151B20] transition group-hover:text-[#FF6A00]">
          {post.title || "Nomsiz maqola"}
        </h3>

        {post.excerpt && (
          <p className="mt-2 line-clamp-2 max-w-[470px] text-[11px] leading-5 text-[#68717A]">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center gap-4 pt-3 text-[10px] text-[#68717A]">

          <span className="flex items-center gap-1.5">
            <Eye size={13} />
            {formatMetric(post.views_count)}
          </span>

          <span className="flex items-center gap-1.5">
            <MessageIcon />
            {formatMetric(post.comments_count)}
          </span>

          <span className="flex items-center gap-1.5">
            <Heart size={13} />
            {formatMetric(post.likes_count)}
          </span>

          {(post.published_at || post.created_at) && (
            <span className="ml-auto whitespace-nowrap">
              {formatShortDate(post.published_at ?? post.created_at)}
            </span>
          )}

        </div>
      </div>
    </Link>
  )
}

/* ================================================================
   COMMENT ICON
================================================================ */

function MessageIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.8L3 21l1.7-4A8.2 8.2 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
    </svg>
  )
}

/* ================================================================
   MINI STAT
================================================================ */

function MiniStat({
  value,
  label,
  bordered = false,
}: {
  value: string | number
  label: string
  bordered?: boolean
}) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center py-4 text-center",
        bordered
          ? "border-l border-[#EEE8E0]"
          : "",
      ].join(" ")}
    >
      <strong className="text-[18px] font-bold tracking-[-0.03em]">
        {value}
      </strong>

      <span className="mt-1 text-[9px] text-[#747B83]">
        {label}
      </span>
    </div>
  )
}

/* ================================================================
   CATEGORIES
================================================================ */

function CategoriesSidebar() {
  const categories = [
    ["Dasturlash", "12"],
    ["Texnologiya", "6"],
    ["Mahsuldorlik", "4"],
    ["Minimalizm", "3"],
    ["Hayot tajribasi", "2"],
  ]

  return (
    <div className="rounded-[14px] border border-[#EEE7DE] bg-white p-4">

      <h3 className="text-[15px] font-bold">
        Kategoriyalar
      </h3>

      <div className="mt-3 space-y-3">

        {categories.map(([name, count]) => (
          <div
            key={name}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#FFF3E8] text-[#FF6A00]">
                <Sparkles size={11} />
              </span>

              <span className="text-[10px] text-[#30363B]">
                {name}
              </span>
            </div>

            <span className="rounded-full bg-[#F5F0EA] px-2 py-0.5 text-[9px] text-[#77736C]">
              {count}
            </span>
          </div>
        ))}

      </div>
    </div>
  )
}

/* ================================================================
   POPULAR POSTS
================================================================ */

function PopularPosts({
  posts,
}: {
  posts: PostListItem[]
}) {
  return (
    <div className="rounded-[14px] border border-[#EEE7DE] bg-white p-4">

      <h3 className="text-[15px] font-bold">
        Ko‘p o‘qilganlar
      </h3>

      <div className="mt-3 space-y-3">

        {posts.map((post) => (
          <Link
            key={post.uuid}
            href={`/@${post.author.username}/${post.slug}`}
            className="group flex gap-2.5"
          >

            <div className="h-[42px] w-[54px] shrink-0 overflow-hidden rounded-[5px] bg-[#F2EEE9]">
              {post.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <PenLine
                    size={14}
                    className="text-[#BDB5AB]"
                  />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="line-clamp-2 text-[9px] font-semibold leading-4 text-[#24282C] group-hover:text-[#FF6A00]">
                {post.title || "Nomsiz maqola"}
              </p>

              <span className="mt-1 flex items-center gap-1 text-[8px] text-[#7B7F83]">
                <Eye size={10} />
                {formatMetric(post.views_count)}
              </span>
            </div>

          </Link>
        ))}

      </div>
    </div>
  )
}

/* ================================================================
   EMPTY
================================================================ */

function EmptyArticles() {
  return (
    <div className="rounded-[12px] border border-[#EEE7DE] bg-white p-14 text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF3E8] text-[#FF6A00]">
        <PenLine size={21} />
      </div>

      <h3 className="mt-4 text-[14px] font-semibold">
        Hali maqola yo‘q
      </h3>

      <p className="mt-1 text-[11px] text-[#77736C]">
        Bu muallif hali biror narsa yozmagan.
      </p>
    </div>
  )
}


/* ================================================================
   HELPERS
================================================================ */

function formatMetric(value: number | string) {
  const number = Number(value) || 0

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)}M`
  }

  if (number >= 1_000) {
    return `${(number / 1_000).toFixed(1)}K`
  }

  return String(number)
}

function formatShortDate(value: string) {
  try {
    const date = new Date(value)

    return new Intl.DateTimeFormat("uz-UZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date)
  } catch {
    return value
  }
}