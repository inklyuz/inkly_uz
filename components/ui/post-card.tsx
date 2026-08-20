import Image from "next/image"
import Link from "next/link"
import {
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { VerifiedDot } from "@/components/ui/badge"
import {
  formatCount,
  formatDate,
} from "@/lib/utils/format"

import type { PostListItem } from "@/types/api"

interface PostCardProps {
  post: PostListItem
  variant?: "list" | "grid"
}

export function PostCard({
  post,
  variant = "list",
}: PostCardProps) {
  const url = `/@${post.author.username}/${post.slug}`
  const category = post.categories?.[0]

  /* ==============================================================
     GRID
  ============================================================== */

  if (variant === "grid") {
    return (
      <article
        className="
          group
          overflow-hidden
          rounded-[12px]
          border
          border-[#E8E3DD]
          bg-white
          transition-all
          duration-200
          hover:border-[#DCD5CC]
          hover:shadow-[0_4px_18px_rgba(20,20,20,0.04)]
        "
      >
        {/* Cover */}
        <Link
          href={url}
          className="
            relative
            block
            aspect-[16/9]
            overflow-hidden
            bg-[#F2F0EC]
          "
        >
          {post.cover ? (
            <Image
              src={post.cover}
              alt=""
              fill
              sizes="
                (max-width: 640px) 100vw,
                50vw
              "
              className="
                object-cover
                transition-transform
                duration-500
                group-hover:scale-[1.035]
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
                text-[#B5B0A9]
              "
            >
              ✦
            </div>
          )}
        </Link>

        <div className="p-4">

          {/* Category */}
          {category && (
            <Link
              href={`/posts?category=${encodeURIComponent(
                category.slug,
              )}`}
              className="
                text-[11px]
                font-medium
                text-[#FF6A00]
                hover:text-[#E84F05]
              "
            >
              {category.name}
            </Link>
          )}

          {/* Title */}
          <h3
            className="
              mt-1.5
              line-clamp-2
              text-[17px]
              font-semibold
              leading-[1.3]
              tracking-[-0.02em]
              text-[#171717]
            "
          >
            <Link
              href={url}
              className="hover:text-[#FF6A00]"
            >
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p
              className="
                mt-1.5
                line-clamp-2
                text-[12px]
                leading-[1.6]
                text-[#6C6A67]
              "
            >
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div
            className="
              mt-4
              flex
              items-center
              justify-between
              gap-3
              border-t
              border-[#E8E3DD]
              pt-3
            "
          >
            <Link
              href={`/@${post.author.username}`}
              className="
                flex
                min-w-0
                items-center
                gap-2
              "
            >
              <Avatar
                src={post.author.avatar}
                name={post.author.full_name}
                size={24}
              />

              <span
                className="
                  truncate
                  text-[10px]
                  font-medium
                  text-[#444]
                "
              >
                @{post.author.username}
              </span>

              {post.author.is_verified && (
                <VerifiedDot />
              )}
            </Link>

            <div
              className="
                flex
                items-center
                gap-2.5
                text-[10px]
                text-[#777]
              "
            >
              <span className="flex items-center gap-1">
                <Heart size={13} />
                {formatCount(post.likes_count)}
              </span>

              <span className="flex items-center gap-1">
                <Eye size={13} />
                {formatCount(post.views_count)}
              </span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  /* ==============================================================
     LIST
  ============================================================== */

  return (
    <article
      className="
        group
        relative
        flex
        min-h-[156px]
        overflow-hidden
        rounded-[12px]
        border
        border-[#E8E3DD]
        bg-white
        transition-all
        duration-200
        hover:border-[#DCD5CC]
        hover:shadow-[0_4px_18px_rgba(20,20,20,0.04)]
      "
    >
      {/* ==========================================================
          COVER
      =========================================================== */}

      <Link
        href={url}
        className="
          relative
          block
          w-[205px]
          shrink-0
          overflow-hidden
          bg-[#F2F0EC]
          sm:w-[220px]
          lg:w-[232px]
        "
      >
        {post.cover ? (
          <Image
            src={post.cover}
            alt=""
            fill
            sizes="232px"
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-[1.035]
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              min-h-[156px]
              items-center
              justify-center
              text-[#B5B0A9]
            "
          >
            ✦
          </div>
        )}
      </Link>

      {/* ==========================================================
          CONTENT
      =========================================================== */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
          px-5
          py-4
        "
      >
        {/* Category */}
        {category && (
          <Link
            href={`/posts?category=${encodeURIComponent(
              category.slug,
            )}`}
            className="
              w-fit
              text-[11px]
              font-medium
              text-[#FF6A00]
              hover:text-[#E84F05]
            "
          >
            {category.name}
          </Link>
        )}

        {/* Title */}
        <h3
          className="
            mt-2
            line-clamp-2
            text-[17px]
            font-semibold
            leading-[1.3]
            tracking-[-0.02em]
            text-[#171717]
            sm:text-[18px]
          "
        >
          <Link
            href={url}
            className="hover:text-[#FF6A00]"
          >
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            className="
              mt-1.5
              line-clamp-2
              max-w-[650px]
              text-[12px]
              leading-[1.65]
              text-[#6C6A67]
              sm:text-[13px]
            "
          >
            {post.excerpt}
          </p>
        )}

        {/* Bottom */}
        <div
          className="
            mt-auto
            flex
            items-end
            justify-between
            gap-4
            pt-3
          "
        >
          {/* Author */}
          <div className="flex min-w-0 items-center gap-3">

            <Link
              href={`/@${post.author.username}`}
              className="
                flex
                min-w-0
                items-center
                gap-2
              "
            >
              <Avatar
                src={post.author.avatar}
                name={post.author.full_name}
                size={24}
              />

              <span
                className="
                  max-w-[120px]
                  truncate
                  text-[11px]
                  font-medium
                  text-[#333]
                  hover:text-[#FF6A00]
                "
              >
                @{post.author.username}
              </span>

              {post.author.is_verified && (
                <VerifiedDot />
              )}
            </Link>

            <span className="h-3 w-px bg-[#E2DED8]" />

            <span
              className="
                whitespace-nowrap
                text-[10px]
                text-[#88847E]
              "
            >
              {post.published_at
                ? formatDate(post.published_at)
                : "Qoralama"}
            </span>
          </div>

          {/* Actions */}
          <div
            className="
              flex
              shrink-0
              items-center
              gap-3
              text-[#68645F]
            "
          >
            <span className="flex items-center gap-1 text-[10px]">
              <Heart size={14} />
              {formatCount(post.likes_count)}
            </span>

            <span className="hidden items-center gap-1 text-[10px] sm:flex">
              <MessageCircle size={13} />
              {formatCount(post.comments_count)}
            </span>

            <span className="hidden items-center gap-1 text-[10px] md:flex">
              <Eye size={13} />
              {formatCount(post.views_count)}
            </span>

            <button
              type="button"
              aria-label="Saqlash"
              className="
                ml-1
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                hover:bg-[#F5F2EE]
                hover:text-[#FF6A00]
              "
            >
              <Bookmark
                size={14}
                strokeWidth={1.7}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}