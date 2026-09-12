// app/(public)/profile/[username]/page.tsx  —  Haqida tab profil ma'lumotlarini ko'rsatadi, sidebar'da emas

import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { getMediaUrl } from "@/lib/api/client"
import { MarketingContainer } from "@/components/layout/containers"
import { getPublicAuthorSafe, getPublicAuthorPostsSafe } from "@/lib/api/public"

import { AvatarGlow } from "@/components/profile/avatar-glow"
import { MobileHero } from "@/components/profile/mobile-hero"
import { MobileProfileBody } from "@/components/profile/mobile-profile-body"
import { ProfileBanner } from "@/components/profile/profile-banner"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabbedContent } from "@/components/profile/profile-tabbed-content"

/* ================================================================
   TYPES
================================================================ */

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

function isInvalidUsername(username: string): boolean {
  return /\.[a-zA-Z0-9]{1,5}$/.test(username) || username.startsWith("_")
}

/* ================================================================
   METADATA
================================================================ */

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username: rawUsername } = await params
  const username = decodeURIComponent(rawUsername).replace(/^@/, "")

  if (isInvalidUsername(username)) {
    return { title: "Foydalanuvchi topilmadi" }
  }

  const user = await getPublicAuthorSafe(username)
  if (!user) return { title: "Foydalanuvchi topilmadi" }
  return {
    title: `@${user.username} -  Inkly profili`,
    description: user.bio ?? `${user.full_name} ning Inkly profili`,
  }
}

/* ================================================================
   PAGE
================================================================ */

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username: rawUsername } = await params
  const username = decodeURIComponent(rawUsername).replace(/^@/, "")

  if (isInvalidUsername(username)) notFound()

  const user = await getPublicAuthorSafe(username)
  if (!user) notFound()

  const postsData = await getPublicAuthorPostsSafe(user.slug ?? user.username, {
    page_size: 12,
  })

  const articleCount = postsData.total
  const avatarUrl = user.avatar ? (getMediaUrl(user.avatar) ?? "") : ""

  const totalViews = postsData.items.reduce((acc, p) => acc + (p.views_count ?? 0), 0)
  const totalLikes = postsData.items.reduce((acc, p) => acc + (p.likes_count ?? 0), 0)

  return (
    <main className="min-h-screen bg-[#F8F6F3]">
      {/*
        BITTA AvatarGlow — avatardan rang faqat shu yerda, bir marta
        hisoblanadi (--glow-r/g/b CSS o'zgaruvchilari). Mobil Hero,
        FollowButton, ikonalar, statistika, tab — hammasi shu bitta
        manbadan (ACCENT_COLOR) foydalanadi. Faqat Hero (katta rasm
        blok) mobil/desktop uchun alohida komponent.
      */}
      <AvatarGlow avatarUrl={avatarUrl}>
        {/* ── Mobile: Hero + Body ── */}
        <MobileHero user={user} />
        <MobileProfileBody
          user={user}
          posts={postsData.items}
          articleCount={articleCount}
          totalViews={totalViews}
          totalLikes={totalLikes}
        />

        {/* ── Desktop Layout ── */}
        <div className="hidden sm:block">
          {/* Banner — faqat fon */}
          <ProfileBanner avatarUrl={avatarUrl} />

          {/* Header — avatar, ism, statistika, follow tugmasi */}
          <div className="border-b border-[#EDE8E3] bg-white">
            <MarketingContainer>
              <ProfileHeader
                user={user}
                avatarUrl={avatarUrl}
                articleCount={articleCount}
                totalViews={totalViews}
              />
            </MarketingContainer>
          </div>

          {/* Tabs + Body — "Haqida" bosilganda profil ma'lumotlari shu yerda chiqadi,
              standart holatda faqat maqolalar ko'rinadi, sidebar'da profil ma'lumoti YO'Q */}
          <ProfileTabbedContent
            user={user}
            posts={postsData.items}
            articleCount={articleCount}
            totalViews={totalViews}
            totalLikes={totalLikes}
          />
        </div>
      </AvatarGlow>
    </main>
  )
}
