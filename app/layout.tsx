import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/auth/context'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inkly.uz'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Inkly — Yozing. Nashr qiling. O\'sing.',
    template: '%s — Inkly',
  },
  description:
    "O'zbek tilida yozadigan ijodkorlar uchun nashriyot platformasi. Maqola yozing, nashr qiling va auditoriya yarating.",
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Inkly',
    title: 'Inkly — Yozing. Nashr qiling. O\'sing.',
    description: "O'zbek tilidagi creator publishing platformasi.",
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)'  },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FFFFFF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className="bg-white">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
