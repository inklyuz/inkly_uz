"use client"

import Link from "next/link"
import {
    ArrowUpRight,
    BriefcaseBusiness,
    Code2,
    FlaskConical,
    GraduationCap,
    Palette,
    Sparkles,
    Tag,
    TrendingUp,
    UserRound,
} from "lucide-react"

import type { CategoryPublicResponse } from "@/types/api"

interface PostsAsideProps {
    categories: CategoryPublicResponse[]
    totalPosts: number
}

const categoryIcons = [
    Tag,
    BriefcaseBusiness,
    Code2,
    Palette,
    UserRound,
    FlaskConical,
    Sparkles,
    GraduationCap,
]

export function PostsAside({
    categories,
    totalPosts,
}: PostsAsideProps) {
    return (
        <aside className="flex w-full flex-col gap-4">
            <CategoriesCard
                categories={categories}
                totalPosts={totalPosts}
            />

            <TrendingCard />

            <SubscribeCard />
        </aside>
    )
}

function CategoriesCard({
    categories,
    totalPosts,
}: {
    categories: CategoryPublicResponse[]
    totalPosts: number
}) {
    return (
        <section className="rounded-xl border border-[#E8E3DD] bg-white p-4">
            <h2 className="mb-4 text-base font-semibold tracking-tight text-[#141414]">
                Kategoriyalar
            </h2>

            <div className="flex flex-col gap-1">
                <CategoryItem
                    href="/posts"
                    label="Barchasi"
                    count={totalPosts}
                    icon={Tag}
                    active
                />

                {categories.slice(0, 8).map((category, index) => {
                    const Icon =
                        categoryIcons[index % categoryIcons.length]

                    return (
                        <CategoryItem
                            key={category.uuid}
                            href={
                                `/posts?category=` +
                                encodeURIComponent(category.slug)
                            }
                            label={category.name}
                            count={Number(category.posts_count) || 0}
                            icon={Icon}
                        />
                    )
                })}
            </div>

            {categories.length > 8 && (
                <Link
                    href="/categories"
                    className="mt-3 flex items-center gap-1 text-sm font-medium text-[#FF6A00] transition-colors hover:text-[#E94F00]"
                >
                    Barcha kategoriyalar
                    <ArrowUpRight size={14} />
                </Link>
            )}
        </section>
    )
}

function CategoryItem({
    href,
    label,
    count,
    icon: Icon,
    active = false,
}: {
    href: string
    label: string
    count?: number
    icon: React.ElementType
    active?: boolean
}) {
    return (
        <Link
            href={href}
            className={[
                "flex min-h-9 items-center gap-2",
                "rounded-lg px-2 py-1.5 text-sm",
                "transition-colors",
                active
                    ? "bg-[#FFF3E8] text-[#FF6A00]"
                    : "text-[#30343B] hover:bg-[#F8F7F5]",
            ].join(" ")}
        >
            <span
                className={[
                    "flex h-4 w-4 shrink-0",
                    "items-center justify-center",
                    "rounded-[4px] border",
                    active
                        ? "border-[#FF8A52]"
                        : "border-[#BFC3C7]",
                ].join(" ")}
            >
                <Icon size={10} strokeWidth={1.7} />
            </span>

            <span className="min-w-0 flex-1 truncate">
                {label}
            </span>

            {typeof count === "number" && (
                <span
                    className={[
                        "rounded-full px-2 py-0.5",
                        "text-[11px] font-medium",
                        active
                            ? "bg-white text-[#FF6A00]"
                            : "bg-[#F4F4F3] text-[#6B7280]",
                    ].join(" ")}
                >
                    {count}
                </span>
            )}
        </Link>
    )
}

function TrendingCard() {
    return (
        <section className="rounded-xl border border-[#E8E3DD] bg-white p-4">
            <div className="mb-4 flex items-center gap-2">
                <TrendingUp
                    size={17}
                    className="text-[#FF6A00]"
                />

                <h2 className="text-base font-semibold tracking-tight text-[#141414]">
                    Trenddagi maqolalar
                </h2>
            </div>

            <Link
                href="/posts"
                className="group flex gap-3"
            >
                <span className="w-4 shrink-0 text-sm font-medium text-[#FF6A00]">
                    1
                </span>

                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#30343B] group-hover:text-[#FF6A00]">
                        Test
                    </p>

                    <p className="mt-0.5 text-xs text-[#8A8F98]">
                        Maqola
                    </p>
                </div>
            </Link>
        </section>
    )
}

function SubscribeCard() {
    return (
        <section className="rounded-xl border border-[#FFE8D0] bg-[#FFF3E8] p-4">
            <p className="text-sm font-medium leading-5 text-[#30343B]">
                Yangi maqolalar va imkoniyatlar haqida
                birinchilardan bo‘lib biling.
            </p>

            <form className="mt-4 flex flex-col gap-2">
                <input
                    type="email"
                    placeholder="Email manzilingiz"
                    className={[
                        "h-10 w-full rounded-lg border",
                        "border-[#DDD8D2] bg-white px-3",
                        "text-sm text-[#141414]",
                        "outline-none",
                        "placeholder:text-[#9A9A9A]",
                        "focus:border-[#FF6A00]",
                    ].join(" ")}
                />

                <button
                    type="submit"
                    className={[
                        "flex h-10 items-center",
                        "justify-center gap-2",
                        "rounded-lg bg-[#FF6A00]",
                        "px-4 text-sm font-semibold",
                        "text-white transition-colors",
                        "hover:bg-[#E94F00]",
                    ].join(" ")}
                >
                    Obuna bo‘lish
                    <ArrowUpRight size={14} />
                </button>

                <label
                    className={[
                        "mt-1 flex items-start gap-2",
                        "text-[10px] leading-4 text-[#7B7B7B]",
                    ].join(" ")}
                >
                    <input
                        type="checkbox"
                        className="mt-0.5 h-3 w-3"
                    />

                    <span>
                        Maxfiylik siyosatiga roziman
                    </span>
                </label>
            </form>
        </section>
    )
}