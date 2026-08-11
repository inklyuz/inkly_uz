import type { Metadata } from "next"
import Link from "next/link"
import { CreatorCard } from "@/components/ui/creator-card"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { listCreatorsSafe } from "@/lib/api/creators"

export const metadata: Metadata = {
  title: "Ijodkorlar",
  description: "Inkly'da o'zbek tilida yozadigan ijodkorlar bilan tanishing.",
}

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const creatorsPage = await listCreatorsSafe({ page, page_size: 12 })

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="border-b border-cream-300 pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Jamiyat</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tighter text-ink-900 sm:text-5xl">Ijodkorlar</h1>
        <p className="mt-4 max-w-xl leading-relaxed text-pretty text-ink-600">
          O&apos;zbek tilida yozadigan mualliflar. Har biri o&apos;z mavzusi va o&apos;z ovoziga ega.
        </p>
      </header>

      <section aria-label="Ijodkorlar ro'yxati" className="py-10">
        {creatorsPage.items.length === 0 ? (
          <p className="py-16 text-center text-ink-400">Hozircha ijodkorlar yo&apos;q</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creatorsPage.items.map((creator) => (
              <CreatorCard key={creator.uuid} creator={creator} />
            ))}
          </div>
        )}

        <div className="mt-12">
          <Pagination page={creatorsPage.page} totalPages={creatorsPage.total_pages} basePath="/creators" />
        </div>
      </section>

      <section className="rounded-2xl bg-ink-900 px-6 py-12 text-center sm:px-12">
        <h2 className="text-2xl font-bold tracking-tight text-balance text-cream-100 sm:text-3xl">
          Siz ham ijodkor bo&apos;ling
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-pretty text-cream-400">
          Ro&apos;yxatdan o&apos;ting, ariza qoldiring va inkly.uz/@username manzilingizni oling.
        </p>
        <Link href="/register" className="mt-7 inline-block">
          <Button variant="accent" size="lg">
            Ariza qoldirish
          </Button>
        </Link>
      </section>
    </main>
  )
}
