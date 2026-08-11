import Image from "next/image"
import Link from "next/link"
import { Eye, Heart, MessageCircle } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge, VerifiedDot } from "@/components/ui/badge"
import { formatCount, formatDate } from "@/lib/utils/format"
import type { PostListItem } from "@/types/api"

export function PostCard({ post }: { post: PostListItem }) {
  const url = `/@${post.author.username}/${post.slug}`

  return (
    <article className="group flex flex-col gap-4 rounded-xl border border-cream-300 bg-cream-50 p-5 transition-colors hover:border-cream-400">
      {post.cover && (
        <Link href={url} className="block overflow-hidden rounded-lg bg-cream-200">
          <Image
            src={post.cover || "/placeholder.svg"}
            alt=""
            width={600}
            height={338}
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>
      )}

      {post.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.categories.slice(0, 2).map((category) => (
            <Badge key={category.uuid}>{category.name}</Badge>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-pretty text-ink-900">
          <Link href={url} className="transition-colors group-hover:text-ink-600">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="line-clamp-2 text-sm leading-relaxed text-ink-600">{post.excerpt}</p>}
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-cream-300 pt-4">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/@${post.author.username}`} className="flex min-w-0 items-center gap-2">
            <Avatar src={post.author.avatar} name={post.author.full_name} size={28} />
            <span className="truncate text-sm text-ink-600 hover:text-ink-900">{post.author.full_name}</span>
            {post.author.is_verified && <VerifiedDot />}
          </Link>

          <div className="flex items-center gap-3 text-xs text-ink-400">
            <span className="flex items-center gap-1">
              <Heart size={12} /> {formatCount(post.likes_count)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={12} /> {formatCount(post.comments_count)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> {formatCount(post.views_count)}
            </span>
          </div>
        </div>

        <p className="text-xs text-ink-400">{post.published_at ? formatDate(post.published_at) : "Qoralama"}</p>
      </div>
    </article>
  )
}
