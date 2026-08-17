import { Hero } from "@/components/landing/hero"
import { WaitlistSection } from "@/components/landing/waitlist-section"

export default async function HomePage() {
  return (
    <main>
      <Hero />
      <WaitlistSection />
    </main>
  )
}