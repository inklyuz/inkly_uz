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
      <header className="border-b border-[#E8E3DD] pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">Mavzular</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tighter text-[#141414] sm:text-5xl">Kategoriyalar</h1>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((category) => (
          <li key={category.uuid}>
            <Link
              href={`/categories/${category.slug}`}
              className="group flex h-full flex-col justify-between gap-6 rounded-xl border border-[#E8E3DD] bg-white p-6 transition-colors hover:border-[#FF6A00]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight text-[#141414]">{category.name}</h2>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-[#6B7280] transition-colors group-hover:text-[#FF6A00]"
                    aria-hidden="true"
                  />
                </div>
                {category.description && (
                  <p className="mt-2 text-sm leading-relaxed text-[#36565F]">{category.description}</p>
                )}
              </div>
              <p className="text-xs uppercase tracking-widest text-[#6B7280]">{category.post_count} maqola</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
