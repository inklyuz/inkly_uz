import Link from "next/link"
import { cn } from "@/lib/utils"
import type { CategoryPublicResponse } from "@/types/api"

interface CategoryPillsProps {
  categories: CategoryPublicResponse[]
  activeSlug?: string
  showAll?: boolean
}

export function CategoryPills({ categories, activeSlug, showAll = true }: CategoryPillsProps) {
  const pill =
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors"

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {showAll && (
        <Link
          href="/posts"
          className={cn(pill, !activeSlug ? "border-ink-900 bg-ink-900 text-cream-100" : "border-cream-400 text-ink-600 hover:bg-cream-200")}
        >
          Barchasi
        </Link>
      )}
      {categories.map((category) => {
        const active = category.slug === activeSlug
        return (
          <Link
            key={category.uuid}
            href={`/categories/${category.slug}`}
            className={cn(pill, active ? "border-ink-900 bg-ink-900 text-cream-100" : "border-cream-400 text-ink-600 hover:bg-cream-200")}
          >
            {category.name}
            <span className={cn("text-xs", active ? "text-cream-400" : "text-ink-400")}>{category.post_count}</span>
          </Link>
        )
      })}
    </div>
  )
}
