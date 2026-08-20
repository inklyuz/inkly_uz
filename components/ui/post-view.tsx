"use client"

import { useState } from "react"
import { Grid2X2, List } from "lucide-react"

import { PostCard } from "@/components/ui/post-card"
import type { PostListItem } from "@/types/api"

interface PostViewProps {
  posts: PostListItem[]
}

export function PostView({ posts }: PostViewProps) {
  const [view, setView] = useState<"list" | "grid">("list")

  return (
    <div>
      {/* View switch */}
      <div
        className="
          mb-3
          flex
          justify-end
        "
      >
        <div
          className="
            flex
            h-10
            overflow-hidden
            rounded-[10px]
            border
            border-[#E5E1DB]
            bg-white
          "
        >
          {/* LIST */}
          <button
            type="button"
            onClick={() => setView("list")}
            aria-label="Ro‘yxat ko‘rinishi"
            aria-pressed={view === "list"}
            className={`
              flex
              h-full
              w-10
              items-center
              justify-center
              transition-colors
              ${
                view === "list"
                  ? "bg-[#FFF3E8] text-[#FF6A00]"
                  : "text-[#777] hover:bg-[#F7F5F2]"
              }
            `}
          >
            <List
              size={18}
              strokeWidth={1.8}
            />
          </button>

          {/* GRID */}
          <button
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid ko‘rinishi"
            aria-pressed={view === "grid"}
            className={`
              flex
              h-full
              w-10
              items-center
              justify-center
              transition-colors
              ${
                view === "grid"
                  ? "bg-[#FFF3E8] text-[#FF6A00]"
                  : "text-[#777] hover:bg-[#F7F5F2]"
              }
            `}
          >
            <Grid2X2
              size={17}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>

      {/* Posts */}
      {view === "list" ? (
        <div className="space-y-2.5">
          {posts.map((post) => (
            <PostCard
              key={post.uuid}
              post={post}
              variant="list"
            />
          ))}
        </div>
      ) : (
        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          {posts.map((post) => (
            <PostCard
              key={post.uuid}
              post={post}
              variant="grid"
            />
          ))}
        </div>
      )}
    </div>
  )
}