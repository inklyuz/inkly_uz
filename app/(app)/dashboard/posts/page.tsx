"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { BookOpen, Loader2, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { formatCount, formatDate } from "@/lib/utils/format"
import type { Page, PostListItem, PostStatus } from "@/types/api"

const PAGE_SIZE = 10
const statuses: Array<{ value: PostStatus | "all"; label: string }> = [
  { value: "all", label: "Barchasi" },
  { value: "published", label: "Nashr qilingan" },
  { value: "draft", label: "Qoralamalar" },
  { value: "archived", label: "Arxiv" },
]

export default function DashboardPostsPage() {
  return <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}><DashboardPostsContent /></Suspense>
}

function DashboardPostsContent() {
  const { state } = useAuth()
  const { token, user, loading: authLoading } = state
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)
  const search = searchParams.get("search") ?? ""
  const statusParam = searchParams.get("status") as PostStatus | null
  const status = statuses.some((item) => item.value === statusParam) ? statusParam ?? "all" : "all"

  const [query, setQuery] = useState(search)
  const [data, setData] = useState<Page<PostListItem> | null>(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setQuery(search), [search])

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login")
  }, [authLoading, router, user])

  useEffect(() => {
    if (!token) return
    let active = true
    setFetching(true)
    setError(null)
    postsApi.myList(token, {
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      status: status === "all" ? undefined : status,
    }).then((result) => {
      if (active) setData(result)
    }).catch((err) => {
      if (active) setError(err instanceof Error ? err.message : "Maqolalarni yuklab bo'lmadi")
    }).finally(() => {
      if (active) setFetching(false)
    })
    return () => { active = false }
  }, [authLoading, page, search, status, token])

  const updateQuery = (values: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString())
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key))
    if (!values.page) next.delete("page")
    router.push(`${pathname}${next.toString() ? `?${next.toString()}` : ""}`)
  }

  const counts = useMemo(() => data?.items.reduce((result, post) => {
    result[post.status] += 1
    return result
  }, { published: 0, draft: 0, archived: 0 } as Record<PostStatus, number>), [data])

  if (authLoading || !user) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
  }

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-primary">Kontent boshqaruvi</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Maqolalarim</h1>
          <p className="text-sm text-muted-foreground">Barcha maqolalaringizni status bo'yicha boshqaring.</p>
        </div>
        <Link href="/write" className="inline-flex items-center justify-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-inkly-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"> <Plus data-icon="inline-start" /> Yangi maqola</Link>
      </header>

      <section className="flex flex-col gap-3 rounded-panel border border-border bg-background p-4 shadow-card sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.keyCode === 229) return
            if (event.key === "Enter") updateQuery({ search: query.trim() || undefined, page: undefined })
          }} placeholder="Maqolalarni qidiring" className="pl-10" aria-label="Maqolalarni qidiring" />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Status bo'yicha filter">
          {statuses.map((item) => (
            <Button key={item.value} variant={status === item.value ? "accent" : "outline"} size="sm" onClick={() => updateQuery({ status: item.value === "all" ? undefined : item.value, page: undefined })}>
              {item.label}{counts && item.value !== "all" ? ` (${counts[item.value]})` : ""}
            </Button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-panel border border-border bg-background shadow-card">
        {fetching ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div> : error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={() => router.refresh()}>Qayta urinish</Button></div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center"><BookOpen className="text-muted-foreground" /><p className="text-sm text-muted-foreground">Bu filter uchun maqola topilmadi.</p><Link href="/write" className="inline-flex items-center justify-center rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-inkly-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Birinchi maqolangizni yozing</Link></div>
        ) : (
          <div className="divide-y divide-border">
            {data.items.map((post) => <PostRow key={post.uuid} post={post} />)}
          </div>
        )}
      </section>

      {data && <Pagination page={data.page} totalPages={data.pages} basePath="/dashboard/posts" query={{ search: search || undefined, status: status === "all" ? undefined : status }} />}
    </main>
  )
}

function PostRow({ post }: { post: PostListItem }) {
  return <article className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40">
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <Link href={`/write?edit=${post.uuid}`} className="truncate font-semibold text-foreground hover:text-primary">{post.title || "Sarlavsiz"}</Link>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={post.status === "published" ? "default" : "muted"}>{post.status === "published" ? "Nashr qilingan" : post.status === "draft" ? "Qoralama" : "Arxiv"}</Badge>
        <span>{formatDate(post.updated_at)}</span>
        {post.status === "published" && <span>{formatCount(post.views_count)} ko'rish</span>}
      </div>
    </div>
    <Link href={`/write?edit=${post.uuid}`} className="inline-flex items-center justify-center rounded-control border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:border-primary hover:text-primary">Tahrirlash</Link>
  </article>
}
