import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { CreatorPublicResponse } from "@/types/api"

export function CreatorCard({ creator }: { creator: CreatorPublicResponse }) {
  return (
    <Link
      href={`/@${creator.username}`}
      className="group flex flex-col gap-4 rounded-xl border border-cream-300 bg-cream-50 p-5 transition-colors hover:border-ink-900"
    >
      <div className="flex items-start justify-between gap-3">
        <Avatar src={creator.avatar_url} name={creator.full_name} size={48} />
        <ArrowUpRight size={18} className="text-ink-400 transition-colors group-hover:text-ink-900" />
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold tracking-tight text-ink-900">{creator.full_name}</p>
          {creator.is_verified && <Badge variant="lime">Tasdiqlangan</Badge>}
        </div>
        <p className="mt-0.5 text-sm text-ink-400">@{creator.username}</p>
      </div>

      {creator.bio && <p className="line-clamp-2 text-sm leading-relaxed text-ink-600">{creator.bio}</p>}
    </Link>
  )
}
