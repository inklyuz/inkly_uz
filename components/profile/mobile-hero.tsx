"use client"

import { useState } from "react"
import NextImage from "next/image"
import { Send, Globe } from "lucide-react"
import { Github, Twitter, Instagram, Youtube } from "@/components/ui/brand-icons"
import { VerifiedDot } from "@/components/ui/badge"
import { getMediaUrl } from "@/lib/api/client"
import { getPublicAuthorSafe } from "@/lib/api/public"
import { FollowButton } from "@/components/profile/follow-button"
import { ShareButton } from "@/components/profile/share-button"
import { ACCENT_COLOR, ACCENT_COLOR_SOFT } from "@/lib/theme/accent"

// Backendda nima bo'lsa, aynan shu (desktop bilan bir xil) turdan foydalanamiz —
// alohida qisqartirilgan interfeys emas, shuning uchun website/location/youtube
// kabi maydonlar mobil'da ham to'liq chiqadi.
type ProfileUser = NonNullable<Awaited<ReturnType<typeof getPublicAuthorSafe>>>

// ─── Mask konstantalari ─────────────────────────────────────────────────────

const RADIAL_MASK = `radial-gradient(110.26% 96% at 50% 0%,
    #000 50%,
    rgba(0,0,0,0.99) 54.68%,
    rgba(0,0,0,0.97) 58.79%,
    rgba(0,0,0,0.94) 62.4%,
    rgba(0,0,0,0.90) 65.61%,
    rgba(0,0,0,0.85) 68.52%,
    rgba(0,0,0,0.79) 71.2%,
    rgba(0,0,0,0.72) 73.75%,
    rgba(0,0,0,0.65) 76.25%,
    rgba(0,0,0,0.57) 78.8%,
    rgba(0,0,0,0.48) 81.48%,
    rgba(0,0,0,0.39) 84.39%,
    rgba(0,0,0,0.30) 87.6%,
    rgba(0,0,0,0.20) 91.21%,
    rgba(0,0,0,0.10) 95.32%,
    rgba(0,0,0,0.00) 100%
)`

const BLUR_MASK = `radial-gradient(110.26% 96% at 50% 0%,
    rgba(0,0,0,0.00) 60%,
    rgba(0,0,0,0.01) 64.72%,
    rgba(0,0,0,0.03) 68.55%,
    rgba(0,0,0,0.07) 71.65%,
    rgba(0,0,0,0.12) 74.13%,
    rgba(0,0,0,0.18) 76.15%,
    rgba(0,0,0,0.25) 77.82%,
    rgba(0,0,0,0.33) 79.3%,
    rgba(0,0,0,0.41) 80.7%,
    rgba(0,0,0,0.50) 82.18%,
    rgba(0,0,0,0.59) 83.85%,
    rgba(0,0,0,0.67) 85.87%,
    rgba(0,0,0,0.76) 88.35%,
    rgba(0,0,0,0.85) 91.45%,
    rgba(0,0,0,0.93) 95.28%,
    #000 100%
)`

// ─── MobileHero ─────────────────────────────────────────────────────────────

export function MobileHero({ user }: { user: ProfileUser }) {
    // Mobilda asosiy vizual har doim AVATAR bo'lishi kerak (banner/cover
    // faqat desktop ProfileBanner'da ishlatiladi) — shuning uchun bu yerda
    // cover'ga ustunlik berilmaydi.
    const avatarUrl = user.avatar ? getMediaUrl(user.avatar) : null
    const heroSrc = avatarUrl
    const [ready, setReady] = useState(!heroSrc)

    const initial = user.username?.[0]?.toUpperCase() ?? "?"
    const { telegram, github, twitter, instagram, youtube } = user.socials ?? {}
    const hasSocials = !!(telegram || github || twitter || instagram || youtube || user.website)

    return (
        <section
            className="relative sm:hidden"
            style={{ opacity: ready ? 1 : 0, transition: "opacity 0.4s ease" }}
        >
            {/* ── Top bar ── */}
            <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 pt-5">
                <div />
                <ShareButton iconOnly />
            </div>

            {/* ── Avatar BOR ── */}
            {heroSrc ? (
                <div className="relative w-full" style={{ height: "calc(100vw - 80px)" }}>
                    <div className="absolute inset-0" style={{ backgroundColor: "var(--color-white)" }} />
                    <div
                        className="absolute left-0 right-0 top-0"
                        style={{ height: "100vw", mask: RADIAL_MASK, WebkitMask: RADIAL_MASK }}
                    >
                        <NextImage
                            src={heroSrc}
                            alt=""
                            aria-hidden
                            fill
                            sizes="100vw"
                            priority
                            className="object-cover object-top"
                            onLoad={() => setReady(true)}
                        />
                        <div
                            className="absolute inset-0"
                            style={{ mask: BLUR_MASK, WebkitMask: BLUR_MASK }}
                        />
                    </div>
                </div>
            ) : (
                /* ── Avatar YO'Q — bir xil struktura, LetterTile bilan ── */
                <div className="relative w-full" style={{ height: "calc(100vw - 80px)" }}>
                    <div className="absolute inset-0" style={{ backgroundColor: "var(--color-white)" }} />
                    <div
                        className="absolute left-0 right-0 top-0"
                        style={{ height: "100vw", mask: RADIAL_MASK, WebkitMask: RADIAL_MASK }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{ background: "linear-gradient(160deg, var(--color-text-primary) 0%, #000000 100%)" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: "10%" }}>
                            <LetterTile char={initial} />
                        </div>
                        <div
                            className="absolute inset-0"
                            style={{ mask: BLUR_MASK, WebkitMask: BLUR_MASK }}
                        />
                    </div>
                </div>
            )}

            {/* ── Matn qismi ── */}
            <div
                className="relative z-10 w-full px-6 pb-8 text-center"
                style={{ marginTop: "-32px" }}
            >
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <h1 className="text-[28px] font-bold tracking-[-0.02em] text-text-primary">
                        @{user.username}
                    </h1>
                    {user.is_verified && <VerifiedDot />}
                </div>

                {user.full_name && (
                    <p className="mt-0.5 text-[13px] font-medium text-[#8A8480]">
                        {user.full_name}
                    </p>
                )}

                {user.location && (
                    <p className="mt-0.5 text-[11px] text-[#B0A99F]">{user.location}</p>
                )}

                {user.bio && (
                    <p
                        className="mt-2 line-clamp-2 text-[13px] leading-[1.6]"
                        style={{
                            background: `linear-gradient(90deg, ${ACCENT_COLOR} 0%, ${ACCENT_COLOR_SOFT} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        {user.bio}
                    </p>
                )}

                {hasSocials && (
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        {user.website && (
                            <SocialIcon
                                href={user.website}
                                label="Veb-sayt"
                                color="#525960"
                                hoverBg="rgba(82,89,96,0.06)"
                                hoverBorder="rgba(82,89,96,0.30)"
                            >
                                <Globe size={16} />
                            </SocialIcon>
                        )}
                        {instagram && (
                            <SocialIcon
                                href={`https://instagram.com/${instagram}`}
                                label="Instagram"
                                color="#E1306C"
                                hoverBg="rgba(225,48,108,0.06)"
                                hoverBorder="rgba(225,48,108,0.35)"
                            >
                                <Instagram size={16} />
                            </SocialIcon>
                        )}
                        {telegram && (
                            <SocialIcon
                                href={`https://t.me/${telegram}`}
                                label="Telegram"
                                color="var(--color-brand-telegram)"
                                hoverBg="rgba(38,165,228,0.06)"
                                hoverBorder="rgba(38,165,228,0.35)"
                            >
                                <Send size={16} />
                            </SocialIcon>
                        )}
                        {youtube && (
                            <SocialIcon
                                href={`https://youtube.com/@${youtube}`}
                                label="YouTube"
                                color="#FF0000"
                                hoverBg="rgba(255,0,0,0.06)"
                                hoverBorder="rgba(255,0,0,0.30)"
                            >
                                <Youtube size={16} />
                            </SocialIcon>
                        )}
                        {github && (
                            <SocialIcon
                                href={`https://github.com/${github}`}
                                label="GitHub"
                                color="#24292e"
                                hoverBg="rgba(36,41,46,0.06)"
                                hoverBorder="rgba(36,41,46,0.30)"
                            >
                                <Github size={16} />
                            </SocialIcon>
                        )}
                        {twitter && (
                            <SocialIcon
                                href={`https://twitter.com/${twitter}`}
                                label="Twitter/X"
                                color="#000000"
                                hoverBg="rgba(0,0,0,0.05)"
                                hoverBorder="rgba(0,0,0,0.25)"
                            >
                                <Twitter size={16} />
                            </SocialIcon>
                        )}
                    </div>
                )}

                {/* Follow tugmasi — light variant (default), ACCENT_COLOR bilan, mobil ham desktop bilan bir xil manba */}
                <div className="mt-5 flex justify-center">
                    <FollowButton
                        targetSlug={user.slug ?? user.username}
                        initialIsFollowing={user.is_following ?? false}
                        initialFollowersCount={user.followers_count ?? 0}
                    />
                </div>
            </div>
        </section>
    )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function charColor(ch: string): string {
    const PALETTE = [
        "var(--color-inkly-orange)", "#6C63FF", "#00C9A7", "#FF4757",
        "#FFA502", "#1E90FF", "#FF6B81", "#2ED573",
        "#A855F7", "#F43F5E", "#06B6D4", "#84CC16",
    ]
    const code = ch.toUpperCase().charCodeAt(0)
    return PALETTE[code % PALETTE.length]
}

function LetterTile({ char }: { char: string }) {
    const color = charColor(char)
    return (
        <span
            style={{
                fontSize: "clamp(120px, 38vw, 200px)",
                fontWeight: 900,
                color,
                letterSpacing: "-0.05em",
                lineHeight: 1,
                textShadow: `0 0 80px ${color}99, 0 0 140px ${color}44`,
            }}
        >
            {char.toUpperCase()}
        </span>
    )
}

function SocialIcon({ href, label, color, hoverBg, hoverBorder, children }: {
    href: string
    label: string
    color: string
    hoverBg: string
    hoverBorder: string
    children: React.ReactNode
}) {
    const [hovered, setHovered] = useState(false)

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onTouchStart={() => setHovered(true)}
            onTouchEnd={() => setHovered(false)}
            style={{
                color: color,
                background: hovered ? hoverBg : "var(--color-white)",
                border: `1px solid ${hovered ? hoverBorder : "var(--color-border-default)"}`,
                boxShadow: hovered ? `0 2px 12px ${hoverBg}` : "0 1px 3px rgba(0,0,0,0.06)",
                transition: "background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
            }}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-full active:scale-95"
        >
            {children}
        </a>
    )
}