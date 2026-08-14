import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { AuthProvider } from '@/lib/auth/context'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inkly.uz'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Inkly — Yozing. Nashr qiling. O‘sing.',
    template: '%s — Inkly',
  },
  description:
    "O'zbek tilida yozadigan ijodkorlar uchun nashriyot platformasi. Maqola yozing, nashr qiling va auditoriya yarating.",
  generator: 'v0.app',
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Inkly',
    title: 'Inkly — Yozing. Nashr qiling. O‘sing.',
    description: "O'zbek tilidagi creator publishing platformasi.",
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FFF9F3',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz" className="bg-[#FFF9F3]">
      <body className={`${inter.className} flex min-h-screen flex-col antialiased`}>
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster position="bottom-right" />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
