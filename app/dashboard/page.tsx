"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { Button } from "@/components/ui/button"
import type { PostListItem } from "@/types/api"

export default function DashboardPage() {
  const router = useRouter()
  const { state } = useAuth()
  
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!state.loading && !state.user) {
      router.replace("/login")
      return
    }

    if (state.token) {
      postsApi.myList(state.token, { page_size: 50 })
        .then((res) => {
          setPosts(res.items)
        })
        .catch((err) => {
          setError("Maqolalarni yuklashda xatolik yuz berdi")
          console.error(err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [state, router])

  const handlePublish = async (uuid: string) => {
    if (!state.token) return
    try {
      await postsApi.publish(state.token, uuid)
      setPosts(prev => prev.map(p => p.uuid === uuid ? { ...p, status: "published" } : p))
    } catch (e) {
      alert("Xatolik yuz berdi")
    }
  }

  const handleUnpublish = async (uuid: string) => {
    if (!state.token) return
    try {
      await postsApi.unpublish(state.token, uuid)
      setPosts(prev => prev.map(p => p.uuid === uuid ? { ...p, status: "draft" } : p))
    } catch (e) {
      alert("Xatolik yuz berdi")
    }
  }

  if (loading || state.loading) {
    return <div className="p-12 text-center text-[#6B7280]">Yuklanmoqda...</div>
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between border-b border-[#E8E3DD] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#141414]">Mening maqolalarim</h1>
          <p className="mt-2 text-sm text-[#36565F]">Barcha qoralamalar va chop etilgan maqolalaringiz.</p>
        </div>
        <Link href="/write">
          <Button variant="accent">Yangi maqola yozish</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-[#DC2626]/10 p-4 text-[#DC2626]">{error}</div>
      )}

      {posts.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-[#E8E3DD] p-12 text-center">
          <p className="text-[#6B7280]">Sizda hali maqolalar yo'q.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div key={post.uuid} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-[#E8E3DD] bg-white p-5 shadow-sm transition-colors hover:border-[#FF6A00]/50 gap-4">
              <div className="flex-1">
                <Link href={`/${state.user?.username}/${post.slug}`} className="text-xl font-bold text-[#141414] hover:text-[#FF6A00]">
                  {post.title || "Sarlavhasiz maqola"}
                </Link>
                <div className="mt-2 flex items-center gap-3 text-sm text-[#6B7280]">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    post.status === "published" ? "bg-green-100 text-green-800" :
                    post.status === "draft" ? "bg-[#FFF3E8] text-[#FF6A00]" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {post.status}
                  </span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span>👁 {post.views_count}</span>
                  <span>❤️ {post.likes_count}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Link href={`/write?edit=${post.uuid}`}>
                  <Button variant="outline" size="sm">Tahrirlash</Button>
                </Link>
                
                {post.status === "draft" && (
                  <Button variant="accent" size="sm" onClick={() => handlePublish(post.uuid)}>Nashr qilish</Button>
                )}
                {post.status === "published" && (
                  <Button variant="ghost" size="sm" onClick={() => handleUnpublish(post.uuid)}>Qoralamaga qaytarish</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
