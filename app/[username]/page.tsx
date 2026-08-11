import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ExternalLink, Globe, MapPin } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PostGrid } from "@/components/ui/post-grid"
import { listPostsSafe } from "@/lib/api/posts"
import { getUserSafe } from "@/lib/api/users"

/** "@sardor" yoki "%40sardor" → "sardor"; @ bo'lmasa null */
function parseUsername(raw: string): string | null {
  const decoded = decodeURIComponent(raw)
  if (!decoded.startsWith("@")) return null
  const username = decoded.slice(1)
  return /^[a-zA-Z0-9_]{1,30}$/.test(username) ? username : null
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username: raw } = await params
  const username = parseUsername(raw)
  if (!username) return { title: "Topilmadi" }
  const user = await getUserSafe(username)
  if (!user) return { title: "Topilmadi" }
  return {
    title: `${user.full_name} (@${user.username})`,
    description: user.bio ?? `${user.full_name} — Inkly'dagi ijodkor.`,
  }
}

const socialLinks = (socials: { telegram: string | null; instagram: string | null; youtube: string | null; github: string | null; twitter: string | null }) =>
  [
    socials.telegram && { label: "Telegram", href: `https://t.me/${socials.telegram}` },
    socials.instagram && { label: "Instagram", href: `https://instagram.com/${socials.instagram}` },
    socials.youtube && { label: "YouTube", href: `https://youtube.com/@${socials.youtube}` },
    socials.github && { label: "GitHub", href: `https://github.com/${socials.github}` },
    socials.twitter && { label: "X", href: `https://x.com/${socials.twitter}` },
  ].filter(Boolean) as { label: string; href: string }[]

export default async function CreatorProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: raw } = await params
  const username = parseUsername(raw)
  if (!username) notFound()

  const user = await getUserSafe(username)
  if (!user) notFound()

  const posts = await listPostsSafe({ author: username, page_size: 12 })

  return (
    <main>
      {/* ── Cover ─────────────────────────────────────────────────────── */}
      {user.cover ? (
        <div className="relative h-44 w-full overflow-hidden bg-cream-200 sm:h-60">
          <Image src={user.cover || "/placeholder.svg"} alt="" fill priority className="object-cover" />
        </div>
      ) : (
        <div className="h-24 bg-cream-200 sm:h-32" aria-hidden="true" />
      )}

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* ── Profil bloki ────────────────────────────────────────────── */}
        <header className="pb-10">
          <div className="-mt-10 mb-5 sm:-mt-12">
            <div className="inline-block rounded-full border-4 border-cream-100 bg-cream-100">
              <Avatar src={user.avatar} name={user.full_name} size={88} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{user.full_name}</h1>
            {user.is_verified && <Badge variant="lime">Tasdiqlangan</Badge>}
          </div>
          <p className="mt-1 text-sm text-ink-400">@{user.username}</p>

          {user.bio && <p className="mt-4 max-w-xl leading-relaxed text-pretty text-ink-600">{user.bio}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-400">
            {user.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} aria-hidden="true" /> {user.location}
              </span>
            )}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-ink-900"
              >
                <Globe size={13} aria-hidden="true" />
                {user.website.replace(/^https?:\/\//, "")}
                <ExternalLink size={11} aria-hidden="true" />
              </a>
            )}
          </div>

          {socialLinks(user.socials).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {socialLinks(user.socials).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-cream-400 px-3 py-1 text-xs font-medium text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-900"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </header>

        {/* ── Postlar ─────────────────────────────────────────────────── */}
        <section aria-labelledby="posts-heading" className="border-t border-cream-300 pt-8 pb-20">
          <h2 id="posts-heading" className="mb-6 text-sm font-semibold uppercase tracking-widest text-ink-400">
            Maqolalar · {posts.total}
          </h2>
          <PostGrid posts={posts.items} columns={2} emptyLabel="Hali maqola yo'q" />
        </section>
      </div>
    </main>
  )
}
