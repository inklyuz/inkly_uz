import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { CreatorPublicResponse } from "@/types/api"

export function CreatorCard({ creator }: { creator: CreatorPublicResponse }) {
  return (
    <Link
      href={`/@${creator.username}`}
      className="group flex flex-col gap-4 rounded-xl border border-[#E8E3DD] bg-white p-5 transition-colors hover:border-[#FF6A00]"
    >
      <div className="flex items-start justify-between gap-3">
        <Avatar src={creator.avatar_url} name={creator.full_name} size={48} />
        <ArrowUpRight size={18} className="text-[#6B7280] transition-colors group-hover:text-[#FF6A00]" />
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold tracking-tight text-[#141414]">{creator.full_name}</p>
          {creator.is_verified && <Badge variant="lime">Tasdiqlangan</Badge>}
        </div>
        <p className="mt-0.5 text-sm text-[#6B7280]">@{creator.username}</p>
      </div>

      {creator.bio && <p className="line-clamp-2 text-sm leading-relaxed text-[#36565F]">{creator.bio}</p>}
    </Link>
  )
}
