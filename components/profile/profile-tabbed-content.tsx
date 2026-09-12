"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Bookmark,
  Clock,
  Eye,
  Heart,
  PenLine,
  Sparkles,
  UserRound,
  MessageCircle,
  MapPin,
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
  Globe,
  Send,
  AtSign,
} from "lucide-react"

import { getMediaUrl } from "@/lib/api/client"
import { MarketingContainer } from "@/components/layout/containers"
import type { PostListItem } from "@/types/api"
import { getPublicAuthorSafe } from "@/lib/api/public"
import { formatDate, formatMetric, readingTimeFromPost } from "@/lib/utils/format"
import { localPostHref } from "@/lib/utils/post-url"
import { Github, Twitter, Instagram, Youtube } from "@/components/ui/brand-icons"
import { VerifiedDot } from "@/components/ui/badge"
import { ShareButton } from "@/components/profile/share-button"
import { SortButton } from "@/components/profile/sort-button"
import { ACCENT_COLOR } from "@/lib/theme/accent"

export type ProfileUser = NonNullable<Awaited<ReturnType<typeof getPublicAuthorSafe>>>

type TabKey = "articles" | "about"

interface ProfileTabbedContentProps {
  user: ProfileUser
  posts: PostListItem[]
  articleCount: number
  totalViews: number
  totalLikes: number
}

/**
 * Tab holatini o'zi boshqaradi:
 * - "Maqolalar" tanlanganda: maqolalar ro'yxati asosiy ustunda
 * - "Haqida" tanlanganda: profil ma'lumotlari (bio, joylashuv, socials) asosiy ustunda
 * Profil ma'lumotlari boshqa hech qayerda (sidebar'da) qaytarilmaydi.
 *
 * NOTE: AboutContent, StatsCard, StatCell, ProfilePostCard, EmptyArticles
 * quyida eksport qilinadi — MobileProfileBody xuddi shu bo'laklardan
 * foydalanadi, shu bilan mobil va desktop bitta manbadan (bir xil
 * markup/mantiq) ishlaydi. Faqat joylashuv (layout) farq qiladi.
 */
export function ProfileTabbedContent({
  user,
  posts,
  articleCount,
  totalViews,
  totalLikes,
}: ProfileTabbedContentProps) {
  const [tab, setTab] = useState<TabKey>("articles")

  return (
    <>
      {/* Tabs — bannerga yopishgan oq blok */}
      <div className="border-b border-[#EDE8E3] bg-white">
        <MarketingContainer>
          <div className="flex h-[50px] items-center justify-between">
            <nav className="flex h-full items-center gap-6" aria-label="Profil bo'limlari">
              <ProfileTab
                active={tab === "articles"}
                icon={<Bookmark size={15} strokeWidth={1.8} />}
                onClick={() => setTab("articles")}
              >
                Maqolalar
              </ProfileTab>
              <ProfileTab
                active={tab === "about"}
                icon={<UserRound size={15} strokeWidth={1.8} />}
                onClick={() => setTab("about")}
              >
                Haqida
              </ProfileTab>
            </nav>
            <div className="flex items-center gap-2">
              <ShareButton />
            </div>
          </div>
        </MarketingContainer>
      </div>

      {/* Body */}
      <MarketingContainer className="pb-16 pt-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">

          {/* ── Main column — tabga qarab almashadi ── */}
          <div className="rounded-2xl border border-[#EDE8E3] bg-white overflow-hidden">
            {tab === "articles" ? (
              <>
                <div className="flex items-center justify-between border-b border-[#EDE8E3] px-4 py-3">
                  <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[#141414]">
                    <Bookmark size={15} strokeWidth={1.8} style={{ color: ACCENT_COLOR }} />
                    Maqolalar
                    <span className="rounded-full bg-[#F3EDE7] px-2 py-0.5 text-[10px] font-semibold text-[#9A9390]">
                      {articleCount}
                    </span>
                  </h2>
                  <SortButton />
                </div>
                <div className="p-2">
                  {posts.length === 0 ? (
                    <div className="p-2">
                      <EmptyArticles />
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F3EDE7]">
                      {posts.map((post) => (
                        <ProfilePostCard key={post.uuid} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 border-b border-[#EDE8E3] px-4 py-3">
                  <UserRound size={15} strokeWidth={1.8} style={{ color: ACCENT_COLOR }} />
                  <h2 className="text-[13px] font-semibold text-[#141414]">Muallif haqida</h2>
                </div>
                <div className="px-4 py-4">
                  <AboutContent user={user} />
                </div>
              </>
            )}
          </div>

          {/* ── Sidebar — profil ma'lumotlari yo'q, faqat statistika/mashhur postlar ── */}
          <aside className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
            <StatsCard
              articleCount={articleCount}
              totalViews={totalViews}
              totalLikes={totalLikes}
              followersCount={user.followers_count ?? 0}
              followingCount={user.following_count ?? 0}
            />
            <PopularPosts posts={posts.slice(0, 4)} />
          </aside>
        </div>
      </MarketingContainer>
    </>
  )
}

/* ================================================================
   PROFILE TAB (button, not link — state bilan boshqariladi)
================================================================ */

export function ProfileTab({
  children,
  icon,
  active = false,
  onClick,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? { color: ACCENT_COLOR } : undefined}
      className={[
        "relative flex h-full shrink-0 items-center gap-1.5 text-[13px] font-medium transition-colors duration-200",
        active ? "font-semibold" : "text-[#6B7280] hover:text-[#141414]",
      ].join(" ")}
    >
      {icon}
      {children}
      {active && (
        <span
          className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
          style={{ background: ACCENT_COLOR }}
        />
      )}
    </button>
  )
}

/* ================================================================
   ABOUT CONTENT  — "Haqida" tabida (desktop va mobil'da bir xil)
================================================================ */

export function AboutContent({ user }: { user: ProfileUser }) {
  const hasBio = Boolean(user.bio && user.bio.trim().length > 0)

  return (
    <div className="space-y-4">
      {hasBio ? (
        <p className="text-[13px] leading-[1.75] text-[#525960]">{user.bio}</p>
      ) : (
        <p className="text-[13px] italic leading-[1.75] text-[#B0B6BE]">
          Bu muallif hali o'zi haqida ma'lumot qo'shmagan.
        </p>
      )}

      <dl className="space-y-2.5">
        <div className="flex items-center gap-2 text-[12px] text-[#525960]">
          <UserRound size={13} strokeWidth={1.8} className="text-[#B0B6BE] shrink-0" />
          <span className="font-medium text-[#141414]">{user.full_name}</span>
          {user.is_verified && <VerifiedDot />}
        </div>

        <div className="flex items-center gap-2 text-[12px] text-[#525960]">
          <AtSign size={13} strokeWidth={1.8} className="text-[#B0B6BE] shrink-0" />
          <span>@{user.username}</span>
        </div>

        {user.location && (
          <div className="flex items-center gap-2 text-[12px] text-[#525960]">
            <MapPin size={13} strokeWidth={1.8} className="text-[#B0B6BE] shrink-0" />
            <span>{user.location}</span>
          </div>
        )}

        {user.created_at && (
          <div className="flex items-center gap-2 text-[12px] text-[#525960]">
            <CalendarDays size={13} strokeWidth={1.8} className="text-[#B0B6BE] shrink-0" />
            <span>{formatDate(user.created_at)} dan beri</span>
          </div>
        )}

        {user.website && (
          <div className="flex items-center gap-2 text-[12px] text-[#525960]">
            <Globe size={13} strokeWidth={1.8} className="text-[#B0B6BE] shrink-0" />
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate hover:underline"
              style={{ color: ACCENT_COLOR }}
            >
              {user.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
      </dl>

      {(user.socials?.telegram ||
        user.socials?.instagram ||
        user.socials?.youtube ||
        user.socials?.github ||
        user.socials?.twitter) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[#F3EDE7] pt-3">
          {user.socials?.telegram && (
            <AboutSocialLink href={`https://t.me/${user.socials.telegram}`} label="Telegram">
              <Send size={14} />
            </AboutSocialLink>
          )}
          {user.socials?.instagram && (
            <AboutSocialLink href={`https://instagram.com/${user.socials.instagram}`} label="Instagram">
              <Instagram size={14} />
            </AboutSocialLink>
          )}
          {user.socials?.youtube && (
            <AboutSocialLink href={`https://youtube.com/@${user.socials.youtube}`} label="YouTube">
              <Youtube size={14} />
            </AboutSocialLink>
          )}
          {user.socials?.github && (
            <AboutSocialLink href={`https://github.com/${user.socials.github}`} label="GitHub">
              <Github size={14} />
            </AboutSocialLink>
          )}
          {user.socials?.twitter && (
            <AboutSocialLink href={`https://twitter.com/${user.socials.twitter}`} label="Twitter">
              <Twitter size={14} />
            </AboutSocialLink>
          )}
        </div>
      )}
    </div>
  )
}

function AboutSocialLink({
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
      className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#EDE8E3] bg-[#F8F6F3] text-[#525960] transition hover:border-[#FFB58F] hover:bg-white hover:text-primary"
    >
      {children}
    </a>
  )
}

/* ================================================================
   POST CARD  — Premium editorial style
================================================================ */

export function ProfilePostCard({ post }: { post: PostListItem }) {
  return (
    <Link
      href={localPostHref(post)}
      prefetch={false}
      className="group flex gap-4 rounded-xl p-3 transition-colors duration-200 hover:bg-[#FDF9F6]"
    >
      {/* Cover */}
      <div className="relative h-[92px] w-[136px] shrink-0 overflow-hidden rounded-lg bg-[#F3EDE7] sm:w-[152px]">
        {post.cover ? (
          <Image
            src={getMediaUrl(post.cover) ?? "/placeholder.svg"}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 136px, 152px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PenLine size={20} className="text-[#C4BDB3]" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="line-clamp-2 text-[14.5px] font-bold leading-[1.45] tracking-[-0.02em] text-[#141414] transition-colors duration-200 group-hover:text-primary">
            {post.title || "Nomsiz maqola"}
          </h3>
          {post.excerpt && (
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.65] text-[#9A9390]">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#B0B6BE]">
          {post.reading_time != null && post.reading_time > 0 && (
            <span className="flex items-center gap-1">
              <Clock size={10} strokeWidth={1.8} />
              {readingTimeFromPost(post.reading_time)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye size={10} strokeWidth={1.8} />
            {formatMetric(post.views_count)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={10} strokeWidth={1.8} />
            {formatMetric(post.comments_count)}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={10} strokeWidth={1.8} />
            {formatMetric(post.likes_count)}
          </span>
          {(post.published_at ?? post.created_at) && (
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
   STATS CARD
================================================================ */

export function StatsCard({
  articleCount,
  totalViews,
  totalLikes,
  followersCount,
  followingCount,
}: {
  articleCount: number
  totalViews: number
  totalLikes: number
  followersCount: number
  followingCount: number
}) {
  return (
    <div className="rounded-2xl border border-[#EDE8E3] bg-white overflow-hidden">
      <div className="border-b border-[#EDE8E3] px-4 py-3 flex items-center gap-2">
        <TrendingUp size={15} strokeWidth={1.8} style={{ color: ACCENT_COLOR }} />
        <h3 className="text-[13px] font-semibold text-[#141414]">Statistika</h3>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#EDE8E3]">
        <StatCell value={formatMetric(articleCount)} label="Maqola" />
        <StatCell value={formatMetric(totalViews)} label="Ko'rishlar" />
        <StatCell value={formatMetric(totalLikes)} label="Yoqtirishlar" />
      </div>
      <div className="grid grid-cols-2 divide-x divide-[#EDE8E3] border-t border-[#EDE8E3]">
        <StatCell value={formatMetric(followersCount)} label="Obunachi" />
        <StatCell value={formatMetric(followingCount)} label="Obuna bo'lgan" />
      </div>
    </div>
  )
}

export function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      <strong className="text-[17px] font-bold tracking-[-0.03em] text-[#141414]">
        {value}
      </strong>
      <span className="mt-0.5 text-[9px] font-medium text-[#9A9390] uppercase tracking-wide">
        {label}
      </span>
    </div>
  )
}

/* ================================================================
   POPULAR POSTS
================================================================ */

function PopularPosts({ posts }: { posts: PostListItem[] }) {
  if (posts.length === 0) return null

  return (
    <div className="rounded-2xl border border-[#EDE8E3] bg-white overflow-hidden">
      <div className="border-b border-[#EDE8E3] px-4 py-3 flex items-center gap-2">
        <Sparkles size={15} strokeWidth={1.8} style={{ color: ACCENT_COLOR }} />
        <h3 className="text-[13px] font-semibold text-[#141414]">Ko'p o'qilganlar</h3>
      </div>

      <ul className="divide-y divide-[#F3EDE7]">
        {posts.map((post, index) => (
          <li key={post.uuid}>
            <Link
              href={localPostHref(post)}
              prefetch={false}
              className="group flex items-start gap-3 px-4 py-3 transition-colors duration-200 hover:bg-[#FDF9F6]"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#F3EDE7] text-[9px] font-bold text-[#B0A99F]">
                {index + 1}
              </span>

              <div className="relative h-[40px] w-[52px] shrink-0 overflow-hidden rounded-md bg-[#F3EDE7]">
                {post.cover ? (
                  <Image
                    src={getMediaUrl(post.cover) ?? "/placeholder.svg"}
                    alt=""
                    fill
                    sizes="52px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <PenLine size={13} className="text-[#C4BDB3]" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[11px] font-semibold leading-[1.5] text-[#24282C] transition-colors group-hover:text-primary">
                  {post.title || "Nomsiz maqola"}
                </p>
                <span className="mt-1 flex items-center gap-1 text-[9px] text-[#B0B6BE]">
                  <Eye size={9} strokeWidth={1.8} />
                  {formatMetric(post.views_count)}
                </span>
              </div>

              <ArrowUpRight
                size={13}
                strokeWidth={1.8}
                className="mt-0.5 shrink-0 text-[#D4C5BA] transition-colors group-hover:text-primary"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ================================================================
   EMPTY ARTICLES
================================================================ */

export function EmptyArticles() {
  return (
    <div className="rounded-xl border border-dashed border-[#DDD8D3] bg-[#FDFBF9] px-8 py-14 text-center">
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: "#FFF1E6", color: ACCENT_COLOR }}
      >
        <PenLine size={20} strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 text-[14px] font-semibold text-[#141414]">Hali maqola yo'q</h3>
      <p className="mt-1.5 text-[11px] leading-[1.6] text-[#9A9390]">
        Bu muallif hali biror narsa yozmagan.
      </p>
    </div>
  )
}

/* ================================================================
   HELPERS
================================================================ */

function formatShortDate(value: string | null | undefined): string {
  if (!value) return ""
  try {
    return new Intl.DateTimeFormat("uz-UZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value))
  } catch {
    return value
  }
}
