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
          className={cn(
            pill,
            !activeSlug
              ? "border-[#FF6A00] bg-[#FF6A00] text-white"
              : "border-[#E8E3DD] text-[#36565F] hover:bg-[#FFF3E8] hover:border-[#FF6A00] hover:text-[#FF6A00]",
          )}
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
            className={cn(
              pill,
              active
                ? "border-[#FF6A00] bg-[#FF6A00] text-white"
                : "border-[#E8E3DD] text-[#36565F] hover:bg-[#FFF3E8] hover:border-[#FF6A00] hover:text-[#FF6A00]",
            )}
          >
            {category.name}
            <span className={cn("text-xs", active ? "text-white/70" : "text-[#6B7280]")}>
              {category.post_count}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
