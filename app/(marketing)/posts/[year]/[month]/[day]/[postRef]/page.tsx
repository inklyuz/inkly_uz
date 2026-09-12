import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { Avatar } from "@/components/ui/avatar"
import { Badge, VerifiedDot } from "@/components/ui/badge"
import { CommentSection } from "@/components/ui/comment-section"
import { PostActions } from "@/components/ui/post-actions"
import { BackButton } from "@/components/ui/back-button"
import { getMediaUrl } from "@/lib/api/client"
import {
  getPublicAuthorPostsSafe,
  getPublicAuthorSafe,
  getPublicPostByCanonicalSafe,
} from "@/lib/api/public"
import { formatDate, readingTime } from "@/lib/utils/format"
import { localPostHref } from "@/lib/utils/post-url"
import { parseTeletypeToHtml } from "@/lib/utils/teletype-parser"
import type { PostListItem } from "@/types/api"

interface CanonicalPostPageProps {
  params: Promise<{ year: string; month: string; day: string; postRef: string }>
}

// ---------------------------------------------------------------------------
// Metadata — barcha ijtimoiy tarmoqlar uchun to'liq meta teglar
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: CanonicalPostPageProps): Promise<Metadata> {
  const { year, month, day, postRef } = await params
  const post = await getPublicPostByCanonicalSafe(year, month, day, postRef)
  if (!post) return { title: "Maqola topilmadi" }

  const href = localPostHref(post)
  const coverUrl = post.cover ? (getMediaUrl(post.cover) ?? "") : ""
  const description =
    post.excerpt ?? `${post.author.full_name} tomonidan yozilgan maqola`

  const ogImage = coverUrl
    ? [{ url: coverUrl, width: 1200, height: 630, alt: post.title }]
    : []

  return {
    title: `${post.title} — Inkly`,
    description,
    alternates: { canonical: href },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      authors: [`https://inkly.uz/@${post.author.username}`],
      url: href,
      siteName: "Inkly",
      locale: "uz_UZ",
      images: ogImage,
    },
    twitter: {
      card: coverUrl ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: coverUrl ? [coverUrl] : [],
      site: "@inkly_uz",
      creator: `@${post.author.username}`,
    },
    other: {
      "telegram:channel": "@inkly_uz",
      "article:author": `https://inkly.uz/@${post.author.username}`,
      ...(post.published_at ? { "article:published_time": post.published_at } : {}),
      ...(post.categories.length > 0 ? { "article:section": post.categories[0].name } : {}),
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default async function CanonicalPostPage({
  params,
}: CanonicalPostPageProps) {
  const { year, month, day, postRef } = await params
  const post = await getPublicPostByCanonicalSafe(year, month, day, postRef)
  if (!post) notFound()

  const [author, relatedData] = await Promise.all([
    getPublicAuthorSafe(post.author.slug),
    getPublicAuthorPostsSafe(post.author.slug, { page_size: 4 }),
  ])

  const relatedPosts: PostListItem[] = relatedData.items
    .filter((p) => p.id !== post.id)
    .slice(0, 3)

  const htmlContent = parseTeletypeToHtml(post.content)
  const readTime = readingTime(post.content)
  const coverUrl = post.cover ? (getMediaUrl(post.cover) ?? null) : null

  return (
    <article
      id="inkly-article"
      className="mx-auto px-4 py-12 sm:px-6"
      style={{ maxWidth: "65rem" }}
    >
      {/* ── Orqaga tugmasi ── */}
      <div className="mb-8">
        <BackButton />
      </div>

      {/* ── Kategoriyalar ── */}
      {post.categories.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {post.categories.map((cat) => (
            <Link key={cat.uuid} href={`/categories/${cat.slug}`}>
              <Badge>{cat.name}</Badge>
            </Link>
          ))}
        </div>
      )}

      {/* ── Sarlavha ── */}
      <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl">
        {post.title}
      </h1>

      {/* ── Muallif + meta ── */}
      <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-text-muted">
        <address className="not-italic">
          <Link href={`/@${post.author.username}`} className="flex items-center gap-2">
            <Avatar src={post.author.avatar} name={post.author.full_name} size={36} />
            <div>
              <p className="flex items-center gap-1 font-medium text-text-primary">
                {post.author.full_name}
                {post.author.is_verified && <VerifiedDot />}
              </p>
              <p className="text-xs">@{post.author.username}</p>
            </div>
          </Link>
        </address>

        <span aria-hidden>·</span>

        {post.published_at && (
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
        )}

        <span aria-hidden>·</span>
        <span>{readTime}</span>
      </div>

      {/* ── Maqola matni ── */}
      <div
        className="prose-inkly max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* ── Reaksiyalar + Ulashish (PostActions ichida modal) ── */}
      <div className="mt-12">
        <PostActions
          post={post}
          cover={coverUrl}
        />
      </div>

      {/* ── Muallif kartochkasi ── */}
      {author?.bio && (
        <div className="mt-12 rounded-2xl border border-border-default bg-inkly-orange-light p-6">
          <Link href={`/@${author.username}`} className="mb-3 flex items-center gap-3">
            <Avatar src={author.avatar} name={author.full_name} size={48} />
            <div>
              <p className="flex items-center gap-1.5 font-semibold text-text-primary">
                {author.full_name}
                {author.is_verified && <VerifiedDot />}
              </p>
              <p className="text-sm text-text-muted">@{author.username}</p>
            </div>
          </Link>
          <p className="text-sm leading-relaxed text-text-secondary">{author.bio}</p>
        </div>
      )}

      {/* ── Izohlar ── */}
      {post.allow_comments && (
        <div className="mt-12">
          <CommentSection postId={post.id} />
        </div>
      )}

      {/* ── Boshqa maqolalar ── */}
      {relatedPosts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-5 text-lg font-semibold text-text-primary">
            {post.author.full_name}ning boshqa maqolalari
          </h2>
          <div className="space-y-3">
            {relatedPosts.map((p) => (
              <Link
                key={p.uuid}
                href={localPostHref(p)}
                className="flex items-start gap-4 rounded-xl border border-border-default bg-white p-4 transition-colors hover:border-primary/30"
              >
                {p.cover && (
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-bg-muted">
                    <Image
                      src={getMediaUrl(p.cover) ?? "/placeholder.svg"}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="line-clamp-2 font-semibold text-text-primary transition-colors hover:text-primary">
                    {p.title}
                  </p>
                  {p.excerpt && (
                    <p className="mt-1 line-clamp-1 text-sm text-text-muted">{p.excerpt}</p>
                  )}
                  {p.published_at && (
                    <time dateTime={p.published_at} className="mt-1.5 block text-xs text-text-muted">
                      {formatDate(p.published_at)}
                    </time>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}