"use client"

import { useState } from "react"
import { Bookmark, UserRound } from "lucide-react"

import type { PostListItem } from "@/types/api"
import {
  ProfileTab,
  AboutContent,
  StatCell,
  ProfilePostCard,
  EmptyArticles,
  type ProfileUser,
} from "@/components/profile/profile-tabbed-content"
import { SortButton } from "@/components/profile/sort-button"
import { ShareButton } from "@/components/profile/share-button"
import { formatMetric } from "@/lib/utils/format"
import { ACCENT_COLOR } from "@/lib/theme/accent"

type TabKey = "articles" | "about"

interface MobileProfileBodyProps {
  user: ProfileUser
  posts: PostListItem[]
  articleCount: number
  totalViews: number
  totalLikes: number
}

/**
 * Mobil kontent — desktopdagi ProfileTabbedContent bilan AYNAN bir xil
 * bo'laklardan (AboutContent, StatCell, ProfilePostCard, EmptyArticles,
 * SortButton) foydalanadi va bir xil ACCENT_COLOR manbasidan rang oladi.
 * Faqat joylashuv mobilga moslashtirilgan: sidebar o'rniga statistika
 * tepada karta ko'rinishida, "Haqida" alohida tab sifatida.
 */
export function MobileProfileBody({
  user,
  posts,
  articleCount,
  totalViews,
  totalLikes,
}: MobileProfileBodyProps) {
  const [tab, setTab] = useState<TabKey>("articles")

  return (
    <div className="px-3 pb-10 sm:hidden">
      <div className="space-y-3 mt-3">

        {/* ── Statistika kartasi — desktop StatsCard bilan bir xil ma'lumotlar ── */}
        <div className="rounded-2xl border border-[#EDE8E3] bg-white overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-[#EDE8E3]">
            <StatCell value={formatMetric(articleCount)} label="Maqola" />
            <StatCell value={formatMetric(totalViews)} label="Ko'rishlar" />
            <StatCell value={formatMetric(totalLikes)} label="Yoqtirishlar" />
          </div>
          <div className="grid grid-cols-2 divide-x divide-[#EDE8E3] border-t border-[#EDE8E3]">
            <StatCell value={formatMetric(user.followers_count ?? 0)} label="Obunachi" />
            <StatCell value={formatMetric(user.following_count ?? 0)} label="Obuna bo'lgan" />
          </div>
        </div>

        {/* ── Tabs + Share — desktopdagi bilan bir xil ProfileTab komponenti ── */}
        <div className="rounded-2xl border border-[#EDE8E3] bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 border-b border-[#EDE8E3]">
            <nav className="flex h-[46px] items-center gap-5" aria-label="Profil bo'limlari">
              <ProfileTab
                active={tab === "articles"}
                icon={<Bookmark size={14} strokeWidth={1.8} />}
                onClick={() => setTab("articles")}
              >
                Maqolalar
              </ProfileTab>
              <ProfileTab
                active={tab === "about"}
                icon={<UserRound size={14} strokeWidth={1.8} />}
                onClick={() => setTab("about")}
              >
                Haqida
              </ProfileTab>
            </nav>
            <ShareButton iconOnly />
          </div>

          {tab === "articles" ? (
            <>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#EDE8E3]">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#30363B]">
                  <Bookmark size={13} strokeWidth={1.8} style={{ color: ACCENT_COLOR }} />
                  {articleCount} ta maqola
                </span>
                <SortButton />
              </div>
              <div className="p-3">
                {posts.length === 0 ? (
                  <EmptyArticles />
                ) : (
                  <div className="space-y-2.5">
                    {posts.map((post) => (
                      <ProfilePostCard key={post.uuid} post={post} />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="px-4 py-4">
              <AboutContent user={user} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}