"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function WriteEntryPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/write/editor")
  }, [router])

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[#FF6A00]" />
    </div>
  )
}
