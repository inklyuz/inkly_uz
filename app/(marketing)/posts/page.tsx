import type { Metadata } from "next"
import { ChevronDown } from "lucide-react"

import { PostView } from "@/components/ui/post-view"
import { PostsAside } from "@/components/ui/posts-aside"
import { Pagination } from "@/components/ui/pagination"
import { listCategoriesSafe } from "@/lib/api/categories"
import { listPostsSafe } from "@/lib/api/posts"
import type { CategoryPublicResponse } from "@/types/api"

export const metadata: Metadata = {
  title: "Maqolalar",
  description: "Inkly ijodkorlarining eng yangi maqolalari.",
}

interface PostsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
    sort?: string
  }>
}

export default async function PostsPage({
  searchParams,
}: PostsPageProps) {
  const params = await searchParams

  const page = Math.max(1, Number(params.page) || 1)
  const search = params.search
  const category = params.category
  const sort = params.sort || "newest"

  const [postsPage, categoriesPage] = await Promise.all([
    listPostsSafe({
      page,
      page_size: 10,
      search,
      category,
    }),
    listCategoriesSafe(),
  ])

  const categories = categoriesPage.items

  return (
    <main className="min-h-screen bg-background pt-16 sm:pt-[76px]">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-7 sm:py-7 lg:px-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_276px]">
          <section className="min-w-0">
            <PostsHeader
              sort={sort}
              search={search}
              category={category}
            />

            <CategoryNavigation
              categories={categories}
              active={category}
            />

            {search && (
              <div className="mt-5 text-[13px] text-muted-foreground">
                <strong className="text-foreground">
                  {postsPage.total}
                </strong>{" "}
                ta natija —{" "}
                <span className="italic">{search}</span>
              </div>
            )}

            <div className="mt-3">
              <PostView posts={postsPage.items} />
            </div>

            {postsPage.total_pages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={postsPage.page}
                  totalPages={postsPage.total_pages}
                  basePath="/posts"
                  query={{ search, category, sort }}
                />
              </div>
            )}
          </section>

          <PostsAside
            categories={categories}
            totalPosts={postsPage.total}
          />
        </div>
      </div>
    </main>
  )
}

function PostsHeader({
  sort,
  search,
  category,
}: {
  sort: string
  search?: string
  category?: string
}) {
  const newestParams = new URLSearchParams()

  if (search) newestParams.set("search", search)
  if (category) newestParams.set("category", category)

  const newestQuery = newestParams.toString()
  const newestUrl = newestQuery
    ? `/posts?${newestQuery}`
    : "/posts"

  const oldestParams = new URLSearchParams(newestParams)
  oldestParams.set("sort", "oldest")

  const oldestUrl = `/posts?${oldestParams.toString()}`

  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-[30px] font-bold tracking-[-0.035em] text-foreground sm:text-[32px]">
        Maqolalar
      </h1>

      <details className="relative">
        <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-[10px] border border-border bg-transparent px-3.5 text-[13px] font-medium text-[#292929]">
          {sort === "oldest" ? "Eski" : "Eng yangi"}
          <ChevronDown size={15} />
        </summary>

        <div className="absolute right-0 top-12 z-30 w-36 rounded-xl border border-border bg-background p-1 shadow-lg">
          <a
            href={newestUrl}
            className="block rounded-lg px-3 py-2 text-[13px] hover:bg-muted"
          >
            Eng yangi
          </a>

          <a
            href={oldestUrl}
            className="block rounded-lg px-3 py-2 text-[13px] hover:bg-muted"
          >
            Eski
          </a>
        </div>
      </details>
    </div>
  )
}

function CategoryNavigation({
  categories,
  active,
}: {
  categories: CategoryPublicResponse[]
  active?: string
}) {
  return (
    <nav className="scrollbar-none mt-5 flex gap-1 overflow-x-auto border-b border-border pb-3">
      <CategoryLink
        name="Barchasi"
        href="/posts"
        active={!active}
      />

      {categories.slice(0, 6).map((category) => (
        <CategoryLink
          key={category.uuid}
          name={category.name}
          href={`/posts?category=${encodeURIComponent(category.slug)}`}
          active={active === category.slug}
        />
      ))}

      {categories.length > 6 && (
        <CategoryLink
          name="Ko‘proq"
          href="/categories"
          arrow
        />
      )}
    </nav>
  )
}

function CategoryLink({
  name,
  href,
  active = false,
  arrow = false,
}: {
  name: string
  href: string
  active?: boolean
  arrow?: boolean
}) {
  return (
    <a
      href={href}
      className={`flex shrink-0 items-center gap-1 rounded-[9px] px-4 py-2 text-[12px] font-medium transition ${active
          ? "border border-primary/30 bg-primary/10 text-primary"
          : "border border-transparent text-foreground hover:bg-muted"
        }`}
    >
      {name}
      {arrow && <ChevronDown size={13} />}
    </a>
  )
}
