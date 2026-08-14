import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Eye } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Avatar } from "@/components/ui/avatar"
import { Badge, VerifiedDot } from "@/components/ui/badge"
import { CommentSection } from "@/components/ui/comment-section"
import { ReactionBar } from "@/components/ui/reaction-bar"
import { getCommentsSafe, getPostSafe } from "@/lib/api/posts"
import { formatCount, formatDate, readingTime } from "@/lib/utils/format"

function parseUsername(raw: string): string | null {
  const decoded = decodeURIComponent(raw)
  if (!decoded.startsWith("@")) return null
  return decoded.slice(1) || null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostSafe(slug)
  if (!post) return { title: "Topilmadi" }
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      images: post.cover ? [{ url: post.cover }] : [],
    },
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>
}) {
  const { username: raw, slug } = await params
  if (!parseUsername(raw)) notFound()

  const post = await getPostSafe(slug)
  if (!post) notFound()

  const comments = await getCommentsSafe(slug)

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <article>
        {/* ── Kategoriyalar ────────────────────────────────────────────── */}
        {post.categories.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Link key={category.uuid} href={`/categories/${category.slug}`}>
                <Badge>{category.name}</Badge>
              </Link>
            ))}
          </div>
        )}

        {/* ── Sarlavha ─────────────────────────────────────────────────── */}
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-balance text-[#141414] sm:text-4xl">
          {post.title}
        </h1>

        {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-pretty text-[#36565F]">{post.excerpt}</p>}

        {/* ── Meta qator ───────────────────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-[#E8E3DD] py-4 text-sm text-[#36565F]">
          <Link href={`/@${post.author.username}`} className="flex items-center gap-2">
            <Avatar src={post.author.avatar} name={post.author.full_name} size={32} />
            <span className="font-medium text-[#141414] hover:text-[#FF6A00] transition-colors">{post.author.full_name}</span>
            {post.author.is_verified && <VerifiedDot />}
          </Link>
          <span aria-hidden="true">·</span>
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          <span aria-hidden="true">·</span>
          <span>{readingTime(post.content)}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Eye size={13} aria-hidden="true" /> {formatCount(post.views_count)}
          </span>
        </div>

        {/* ── Cover rasm ───────────────────────────────────────────────── */}
        {post.cover && (
          <figure className="mt-8 overflow-hidden rounded-xl bg-[#F2F4F7]">
            <Image
              src={post.cover || "/placeholder.svg"}
              alt={post.title}
              width={768}
              height={432}
              priority
              className="w-full object-cover"
            />
          </figure>
        )}

        {/* ── Kontent ──────────────────────────────────────────────────── */}
        <div className="prose prose-inkly mt-10 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        {/* ── Reaksiyalar ──────────────────────────────────────────────── */}
        <div className="mt-12 border-t border-[#E8E3DD] pt-8">
          <ReactionBar
            slug={post.slug}
            initialLikes={post.likes_count}
            initialDislikes={post.dislikes_count}
            initialReacted={post.reacted}
          />
        </div>
      </article>

      {/* ── Muallif kartasi ─────────────────────────────────────────────── */}
      <aside className="mt-10 rounded-xl border border-[#E8E3DD] bg-white p-5">
        <div className="flex items-start gap-4">
          <Avatar src={post.author.avatar} name={post.author.full_name} size={48} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/@${post.author.username}`}
                className="font-semibold tracking-tight text-[#141414] hover:text-[#FF6A00] transition-colors"
              >
                {post.author.full_name}
              </Link>
              {post.author.is_verified && <VerifiedDot />}
            </div>
            <p className="mt-0.5 text-sm text-[#6B7280]">@{post.author.username}</p>
            <Link
              href={`/@${post.author.username}`}
              className="mt-2 inline-block text-sm text-[#36565F] underline underline-offset-4 hover:text-[#FF6A00] transition-colors"
            >
              Barcha maqolalarini ko&apos;rish
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Izohlar ─────────────────────────────────────────────────────── */}
      <div className="mt-12">
        <CommentSection slug={post.slug} initialComments={comments.items} totalCount={post.comments_count} />
      </div>
    </main>
  )
}
