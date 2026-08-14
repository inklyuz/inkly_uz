"use client"

import { Search } from "lucide-react"

export function SearchForm({ defaultValue, action = "/posts" }: { defaultValue?: string; action?: string }) {
  return (
    <form action={action} method="get" className="flex w-full max-w-md items-center gap-2" role="search">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#36565F]"
          aria-hidden="true"
        />
        <input
          type="search"
          name="search"
          defaultValue={defaultValue}
          placeholder="Maqolalarni qidirish"
          aria-label="Maqolalarni qidirish"
          className="w-full rounded-lg border border-[#E8E3DD] bg-[#F2F4F7] py-2.5 pl-10 pr-3 text-sm text-[#141414] outline-none transition-colors placeholder:text-[#6B7280] focus:border-[#FF6A00]"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-[#FF6A00] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#E85F00]"
      >
        Qidirish
      </button>
    </form>
  )
}
