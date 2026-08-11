import type { Metadata } from "next"
import { CategoryPills } from "@/components/ui/category-pills"
import { Pagination } from "@/components/ui/pagination"
import { PostGrid } from "@/components/ui/post-grid"
import { SearchForm } from "@/components/ui/search-form"
import { listCategoriesSafe } from "@/lib/api/categories"
import { listPostsSafe } from "@/lib/api/posts"

export const metadata: Metadata = {
  title: "Maqolalar",
  description: "Inkly ijodkorlarining eng yangi maqolalari.",
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const { page: pageParam, search } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const [postsPage, categoriesPage] = await Promise.all([
    listPostsSafe({ page, page_size: 9, search }),
    listCategoriesSafe(),
  ])

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="flex flex-col gap-6 border-b border-cream-300 pb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Kutubxona</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tighter text-ink-900 sm:text-5xl">Maqolalar</h1>
        </div>
        <SearchForm defaultValue={search} />
      </header>

      <div className="py-6">
        <CategoryPills categories={categoriesPage.items} />
      </div>

      {search && (
        <p className="mb-8 text-sm text-ink-600">
          <span className="font-medium text-ink-900">{postsPage.total}</span> natija —{" "}
          <span className="italic">{search}</span>
        </p>
      )}

      <PostGrid posts={postsPage.items} />

      <div className="mt-14">
        <Pagination page={postsPage.page} totalPages={postsPage.total_pages} basePath="/posts" query={{ search }} />
      </div>
    </main>
  )
}
