import Link from 'next/link'
import { LogoMark } from '@/components/ui/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFF9F3]">
      {/* Minimal header */}
      <header className="flex h-14 items-center px-6">
        <Link href="/" className="flex items-center gap-1.5 text-[#141414]">
          <LogoMark size={22} />
          <span className="text-lg font-bold tracking-tighter">inkly</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  )
}