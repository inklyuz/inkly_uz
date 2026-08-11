import { PostCard } from "./post-card"
import { cn } from "@/lib/utils"
import type { PostListItem } from "@/types/api"

interface PostGridProps {
  posts: PostListItem[]
  columns?: 2 | 3
  emptyLabel?: string
}

export function PostGrid({ posts, columns = 3, emptyLabel = "Hozircha maqola yo'q" }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-cream-400 px-6 py-16 text-center">
        <p className="text-sm text-ink-400">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2", columns === 3 && "lg:grid-cols-3")}>
      {posts.map((post) => (
        <PostCard key={post.uuid} post={post} />
      ))}
    </div>
  )
}
