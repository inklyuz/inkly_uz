import Image from "next/image"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/utils/format"

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: number
  className?: string
}

export function Avatar({ src, name, size = 40, className }: AvatarProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn("relative flex-shrink-0 overflow-hidden rounded-full bg-cream-200", className)}
    >
      {src ? (
        <Image src={src || "/placeholder.svg"} alt={name ?? "avatar"} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span
          aria-hidden="true"
          style={{ fontSize: Math.max(10, size * 0.38) }}
          className="flex h-full w-full items-center justify-center font-semibold tracking-tight text-ink-600"
        >
          {initials(name)}
        </span>
      )}
    </div>
  )
}
