import { BarChart3, Globe, Link2, Send } from "lucide-react"
import { Hero } from "@/components/landing/hero"
import { WaitlistSection } from "@/components/landing/waitlist-section"
import { listCategoriesSafe } from "@/lib/api/categories"
import { listCreatorsSafe } from "@/lib/api/creators"
import { listPostsSafe } from "@/lib/api/posts"


export default async function HomePage() {
  const [postsPage, categoriesPage, creatorsPage] = await Promise.all([
    listPostsSafe({ page_size: 10 }),
    listCategoriesSafe(),
    listCreatorsSafe({ page_size: 6 }),
  ])

  return (
    <main>
      <Hero/>
      <WaitlistSection />
    </main>
  )
}