"use client"

import { Search } from "lucide-react"

export function SearchForm({ defaultValue, action = "/posts" }: { defaultValue?: string; action?: string }) {
  return (
    <form action={action} method="get" className="flex w-full max-w-md items-center gap-2" role="search">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
          aria-hidden="true"
        />
        <input
          type="search"
          name="search"
          defaultValue={defaultValue}
          placeholder="Maqolalarni qidirish"
          aria-label="Maqolalarni qidirish"
          className="w-full rounded-lg border border-cream-300 bg-cream-50 py-2.5 pl-10 pr-3 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-ink-900"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-medium text-cream-100 transition-colors hover:bg-ink-900/90"
      >
        Qidirish
      </button>
    </form>
  )
}
