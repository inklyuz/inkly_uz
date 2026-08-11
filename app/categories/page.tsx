import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { listCategoriesSafe } from "@/lib/api/categories"

export const metadata: Metadata = {
  title: "Kategoriyalar",
  description: "Inkly maqolalari kategoriyalar bo'yicha.",
}

export default async function CategoriesPage() {
  const { items } = await listCategoriesSafe()

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="border-b border-cream-300 pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Mavzular</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tighter text-ink-900 sm:text-5xl">Kategoriyalar</h1>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((category) => (
          <li key={category.uuid}>
            <Link
              href={`/categories/${category.slug}`}
              className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-cream-300 bg-cream-50 p-6 transition-colors hover:border-ink-900"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight text-ink-900">{category.name}</h2>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-ink-400 transition-colors group-hover:text-ink-900"
                    aria-hidden="true"
                  />
                </div>
                {category.description && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{category.description}</p>
                )}
              </div>
              <p className="text-xs uppercase tracking-widest text-ink-400">{category.post_count} maqola</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
