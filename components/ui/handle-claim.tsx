import { ArrowRight, Globe } from "lucide-react"

/**
 * inkly.uz/@username — o'z manzilingizni band qiling.
 * Oddiy GET forma: /register?username=... ga yo'naltiradi.
 */
export function HandleClaim({ className }: { className?: string }) {
  return (
    <form action="/register" className={className}>
      <div className="flex w-full max-w-lg items-center gap-2 rounded-2xl border border-[#E8E3DD] bg-white p-1.5 shadow-lg shadow-[#141414]/5 transition-colors focus-within:border-[#FF6A00]">
        {/* Chap: globe + url + input — bitta flex item sifatida */}
        <div className="flex min-w-0 flex-1 items-center gap-2 pl-3">
          <Globe size={18} className="shrink-0 text-[#6B7280]" aria-hidden="true" />
          {/* @ va username orasida joy yo'q */}
          <div className="flex min-w-0 flex-1 items-baseline">
            <span className="shrink-0 text-sm font-medium text-[#141414] leading-none" aria-hidden="true">
              inkly.uz/@
            </span>
            <input
              type="text"
              name="username"
              placeholder="username"
              autoComplete="off"
              spellCheck={false}
              pattern="[a-zA-Z0-9_]{3,30}"
              title="3-30 ta harf, raqam yoki pastki chiziq"
              aria-label="Foydalanuvchi nomi"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-[#FF6A00] placeholder:text-[#FF6A00]/40 outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#FF6A00] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E85F00]"
        >
          Boshlash
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}