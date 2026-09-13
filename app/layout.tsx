import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/auth/context'
import './globals.css'

// ── Typefaces ────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

// ── Metadata ─────────────────────────────────────────────────────────────────

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inkly.uz'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Inkly — Yozing. Nashr qiling. O'sing.",
    template: '%s — Inkly',
  },
  description:
    "O'zbek tilida yozadigan ijodkorlar uchun nashriyot platformasi. Maqola yozing, nashr qiling va auditoriya yarating.",
  keywords: ['blog', 'yozish', "o'zbek", 'maqola', 'nashriyot', 'inkly'],
  authors: [{ name: 'Inkly', url: siteUrl }],
  creator: 'Inkly',
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: siteUrl,
    siteName: 'Inkly',
    title: "Inkly — Yozing. Nashr qiling. O'sing.",
    description: "O'zbek tilidagi creator publishing platformasi.",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Inkly — Yozing. Nashr qiling. O'sing.",
    description: "O'zbek tilidagi creator publishing platformasi.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
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
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: '#FFFFFF',
}

// ── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="uz"
      className={`${inter.variable} ${plusJakarta.variable} bg-white`}
    >
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:         'rounded-lg! border! border-border! bg-surface! text-foreground! shadow-md!',
                title:         'text-sm! font-medium!',
                description:   'text-foreground-muted!',
                actionButton:  'bg-primary! text-primary-foreground!',
                cancelButton:  'bg-background-muted! text-foreground!',
                success:       'border-success-soft-border! bg-success-soft! text-success!',
                error:         'border-destructive/20! bg-destructive/10! text-destructive!',
                warning:       'border-primary-soft! bg-primary-soft! text-warning!',
              },
            }}
          />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}