import { ArrowRight, Globe } from "lucide-react"

/**
 * inkly.uz/@username — o'z manzilingizni band qiling.
 * Oddiy GET forma: /register?username=... ga yo'naltiradi.
 */
export function HandleClaim({ className }: { className?: string }) {
  return (
    <form action="/register" className={className}>
      <div className="flex w-full max-w-lg items-center gap-2 rounded-2xl border border-cream-300 bg-white p-1.5 shadow-lg shadow-ink-900/5 transition-colors focus-within:border-lime-400">
        {/* Chap: globe + url + input — bitta flex item sifatida */}
        <div className="flex min-w-0 flex-1 items-center gap-2 pl-3">
          <Globe size={18} className="shrink-0 text-ink-400" aria-hidden="true" />
          {/* @ va username orasida joy yo'q */}
          <div className="flex min-w-0 flex-1 items-baseline">
            <span className="shrink-0 text-sm font-medium text-ink-900 leading-none" aria-hidden="true">
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
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-lime-600 placeholder:text-lime-600 outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-lime-300"
        >
          Boshlash
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}