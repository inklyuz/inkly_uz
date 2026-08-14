import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CategoryPills } from "@/components/ui/category-pills"
import { Pagination } from "@/components/ui/pagination"
import { PostGrid } from "@/components/ui/post-grid"
import { getCategorySafe, listCategoriesSafe } from "@/lib/api/categories"
import { listPostsSafe } from "@/lib/api/posts"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategorySafe(slug)
  if (!category) return { title: "Kategoriya topilmadi" }
  return {
    title: category.name,
    description: category.description ?? `${category.name} bo'yicha maqolalar.`,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams])
  const page = Math.max(1, Number(pageParam) || 1)

  const [category, categoriesPage] = await Promise.all([getCategorySafe(slug), listCategoriesSafe()])
  if (!category) notFound()

  const postsPage = await listPostsSafe({ page, page_size: 9, category: slug })

  return (
    <main>
      <header className="border-b border-[#E8E3DD] bg-[#FFF9F3] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">Kategoriya</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tighter text-[#141414] sm:text-5xl">{category.name}</h1>
          {category.description && (
            <p className="mt-4 max-w-xl leading-relaxed text-pretty text-[#36565F]">{category.description}</p>
          )}
          <p className="mt-6 inline-block rounded-full bg-[#FF6A00] px-3 py-1 text-xs font-semibold text-white">
            {category.post_count} maqola
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <CategoryPills categories={categoriesPage.items} activeSlug={slug} />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <PostGrid posts={postsPage.items} emptyLabel="Bu kategoriyada hozircha maqola yo'q" />
        <div className="mt-14">
          <Pagination page={postsPage.page} totalPages={postsPage.total_pages} basePath={`/categories/${slug}`} />
        </div>
      </div>
    </main>
  )
}
