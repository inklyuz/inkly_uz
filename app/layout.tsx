import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/lib/auth/context'
import './globals.css'

/**
 * Primary UI / body typeface.
 *
 * Inter is used throughout the application:
 * - navigation
 * - buttons
 * - forms
 * - body text
 * - dashboard
 * - metadata
 * - utility UI
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

/**
 * Editorial display typeface.
 *
 * Reserved for:
 * - landing hero
 * - major section headings
 * - article titles
 * - editorial content
 */
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inkly.uz'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Inkly — Yozing. Nashr qiling. O'sing.",
    template: '%s — Inkly',
  },

  description:
    "O'zbek tilida yozadigan ijodkorlar uchun nashriyot platformasi. Maqola yozing, nashr qiling va auditoriya yarating.",

  applicationName: 'Inkly',

  generator: 'Next.js',

  keywords: [
    'Inkly',
    'o‘zbek',
    'uzbek',
    'maqola',
    'blog',
    'nashr',
    'ijodkor',
    'publishing',
    'creator',
  ],

  authors: [
    {
      name: 'Inkly',
      url: siteUrl,
    },
  ],

  creator: 'Inkly',

  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Inkly',
    title: "Inkly — Yozing. Nashr qiling. O'sing.",
    description:
      "O'zbek tilidagi creator publishing platformasi.",
    url: siteUrl,
  },

  twitter: {
    card: 'summary_large_image',
    title: "Inkly — Yozing. Nashr qiling. O'sing.",
    description:
      "O'zbek tilidagi creator publishing platformasi.",
  },

  robots: {
    index: true,
    follow: true,
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
  themeColor: '#FFFFFF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="uz"
      className={`${inter.variable} ${playfair.variable} bg-white`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}

          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:
                  'rounded-lg! border! border-border! bg-surface! text-foreground! shadow-md!',
                title: 'text-sm! font-medium!',
                description: 'text-foreground-muted!',
                actionButton:
                  'bg-primary! text-primary-foreground!',
                cancelButton:
                  'bg-background-muted! text-foreground!',
                success:
                  'border-success-soft-border! bg-success-soft! text-success!',
                error:
                  'border-destructive/20! bg-destructive/10! text-destructive!',
                warning:
                  'border-primary-soft! bg-primary-soft! text-warning!',
              },
            }}
          />
        </AuthProvider>

        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}