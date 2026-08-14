import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Eye, Heart } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge, VerifiedDot } from "@/components/ui/badge"
import { formatCount, formatDate, readingTime } from "@/lib/utils/format"
import type { PostListItem } from "@/types/api"

export function FeaturedPost({ post, content }: { post: PostListItem; content?: string }) {
  const url = `/@${post.author.username}/${post.slug}`

  return (
    <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      {post.cover ? (
        <Link href={url} className="block overflow-hidden rounded-2xl bg-[#F2F4F7]">
          <Image
            src={post.cover || "/placeholder.svg"}
            alt=""
            width={900}
            height={600}
            priority
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        </Link>
      ) : null}

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {/* "Tanlangan" badge — orange primary */}
          <Badge variant="lime">Tanlangan</Badge>
          {post.categories.slice(0, 2).map((category) => (
            <Badge key={category.uuid} variant="outline">
              {category.name}
            </Badge>
          ))}
        </div>

        <h2 className="text-3xl font-bold leading-[1.1] tracking-tighter text-balance text-[#141414] sm:text-4xl">
          <Link href={url}>{post.title}</Link>
        </h2>

        {post.excerpt && <p className="text-lg leading-relaxed text-pretty text-[#36565F]">{post.excerpt}</p>}

        <div className="flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
          <Link href={`/@${post.author.username}`} className="flex items-center gap-2">
            <Avatar src={post.author.avatar} name={post.author.full_name} size={32} />
            <span className="font-medium text-[#141414]">{post.author.full_name}</span>
            {post.author.is_verified && <VerifiedDot />}
          </Link>
          <span aria-hidden="true">·</span>
          <span>{post.published_at ? formatDate(post.published_at) : "Qoralama"}</span>
          {content && (
            <>
              <span aria-hidden="true">·</span>
              <span>{readingTime(content)}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Heart size={13} /> {formatCount(post.likes_count)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={13} /> {formatCount(post.views_count)}
          </span>
        </div>

        <Link
          href={url}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#FF6A00] underline underline-offset-4 hover:text-[#E85F00]"
        >
          Maqolani o&apos;qish <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  )
}
