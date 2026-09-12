import Image from "next/image"
import { Send, Globe } from "lucide-react"

import { Github, Twitter, Instagram, Youtube } from "@/components/ui/brand-icons"
import { VerifiedDot } from "@/components/ui/badge"
import { FollowButton } from "@/components/profile/follow-button"
import { getPublicAuthorSafe } from "@/lib/api/public"
import { formatMetric } from "@/lib/utils/format"
import { ACCENT_COLOR } from "@/lib/theme/accent"

type ProfileUser = NonNullable<Awaited<ReturnType<typeof getPublicAuthorSafe>>>

interface ProfileHeaderProps {
    user: ProfileUser
    avatarUrl: string
    articleCount: number
    totalViews: number
}

/**
 * YouTube kanal sahifasidagi header'ga o'xshash:
 * katta doira avatar bannerdan chiqib turadi, yonida ism/handle/statistika,
 * o'ngda Obuna (Follow) tugmasi.
 *
 * MUHIM FIX: FollowButton avval "dark" variantda edi (oq fon + oq matn),
 * lekin bu tugma oq fon ustida joylashgan — deyarli ko'rinmas edi.
 * Endi "light" variant (default) + ACCENT_COLOR bilan, mobil hero bilan
 * bir xil.
 */
export function ProfileHeader({ user, avatarUrl, articleCount, totalViews }: ProfileHeaderProps) {
    return (
        <div className="flex flex-col gap-4 pb-5 pt-0 sm:flex-row sm:items-end sm:gap-5">
            {/* Avatar — bannerdan yarmi chiqib turadi */}
            <div className="relative -mt-12 shrink-0 sm:-mt-16">
                <div
                    className="h-[88px] w-[88px] overflow-hidden rounded-full border-[4px] border-white bg-[#F3EDE7] shadow-md sm:h-[112px] sm:w-[112px]"
                >
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={user.full_name}
                            width={112}
                            height={112}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-[28px] font-bold text-[#B0A99F]">
                            {user.full_name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                    )}
                </div>
            </div>

            {/* Ism / handle / statistika / bio */}
            <div className="min-w-0 flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#141414] sm:text-[26px]">
                        {user.full_name}
                    </h1>
                    {user.is_verified && <VerifiedDot />}
                    <span
                        className="rounded-sm border px-2 py-0.5 text-[10px] font-semibold"
                        style={{ borderColor: "#EDE8E3", background: "#F8F6F3", color: ACCENT_COLOR }}
                    >
                        Yozuvchi
                    </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[12px] text-[#9A9390]">
                    <span>@{user.username}</span>
                    <span aria-hidden>·</span>
                    <span>{formatMetric(user.followers_count ?? 0)} obunachi</span>
                    <span aria-hidden>·</span>
                    <span>{articleCount} ta maqola</span>
                    <span aria-hidden>·</span>
                    <span>{formatMetric(totalViews)} ko'rishlar</span>
                    {user.location && (
                        <>
                            <span aria-hidden>·</span>
                            <span>{user.location}</span>
                        </>
                    )}
                </div>

                {user.bio && (
                    <p className="mt-1.5 line-clamp-1 max-w-[560px] text-[12px] leading-[1.6] text-[#6B7280]">
                        {user.bio}
                    </p>
                )}

                {(user.website ||
                    user.socials?.telegram ||
                    user.socials?.instagram ||
                    user.socials?.youtube ||
                    user.socials?.github ||
                    user.socials?.twitter) && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {user.website && (
                            <SocialButton href={user.website} label="Veb-sayt">
                                <Globe size={14} />
                            </SocialButton>
                        )}
                        {user.socials?.telegram && (
                            <SocialButton href={`https://t.me/${user.socials.telegram}`} label="Telegram">
                                <Send size={14} />
                            </SocialButton>
                        )}
                        {user.socials?.instagram && (
                            <SocialButton href={`https://instagram.com/${user.socials.instagram}`} label="Instagram">
                                <Instagram size={14} />
                            </SocialButton>
                        )}
                        {user.socials?.youtube && (
                            <SocialButton href={`https://youtube.com/@${user.socials.youtube}`} label="YouTube">
                                <Youtube size={14} />
                            </SocialButton>
                        )}
                        {user.socials?.github && (
                            <SocialButton href={`https://github.com/${user.socials.github}`} label="GitHub">
                                <Github size={14} />
                            </SocialButton>
                        )}
                        {user.socials?.twitter && (
                            <SocialButton href={`https://twitter.com/${user.socials.twitter}`} label="Twitter">
                                <Twitter size={14} />
                            </SocialButton>
                        )}
                    </div>
                )}
            </div>

            {/* Obuna tugmasi — endi "light" variant (default), oq fonga mos, avatar rangida */}
            <div className="shrink-0 pt-1 sm:pb-1">
                <FollowButton
                    targetSlug={user.slug ?? user.username}
                    initialIsFollowing={user.is_following ?? false}
                    initialFollowersCount={user.followers_count ?? 0}
                />
            </div>
        </div>
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
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#EDE8E3] bg-[#F8F6F3] text-[#525960] transition hover:border-[#FFB58F] hover:bg-white hover:text-primary"
        >
            {children}
        </a>
    )
}
