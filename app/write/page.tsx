"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { InklyEditor } from "@/components/editor/inkly-editor"
import { Button } from "@/components/ui/button"

export default function WritePage() {
  const router = useRouter()
  const { state } = useAuth()
  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Agar foydalanuvchi tizimga kirmagan bo'lsa
  if (!state.loading && !state.user) {
    router.replace("/login")
    return null
  }

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Sarlavha va matn kiritilishi shart")
      return
    }

    if (!state.token) return

    setLoading(true)
    setError(null)

    try {
      // 1. Postni yaratish
      const res = await postsApi.create(state.token, {
        title,
        content,
        visibility: "public",
        categories: [], 
      })

      // 2. Publish qilish
      await postsApi.publish(state.token, res.uuid)

      // 3. Muvaffaqiyatli saqlangach, maqola sahifasiga o'tish
      router.push(`/${state.user?.username}/${res.slug}`)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Maqolani saqlashda xatolik yuz berdi")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm font-medium text-[#6B7280]">Yangi maqola yozish</p>
        <Button onClick={handlePublish} variant="accent" loading={loading} size="sm">
          Chop etish (Publish)
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sarlavha..."
          className="w-full resize-none overflow-hidden bg-transparent text-4xl font-extrabold tracking-tight text-[#141414] outline-none placeholder:text-[#E8E3DD]"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = "auto"
            target.style.height = `${target.scrollHeight}px`
          }}
        />

        <div className="min-h-[500px]">
          <InklyEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  )
}
