/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },

  // ============================================================
  // IMAGES
  // ============================================================

  images: {
    unoptimized: false,

    // Local IP faqat development'da ruxsat
    dangerouslyAllowLocalIP: isDev,

    remotePatterns: [
      // Production
      // TODO: haqiqiy ishlatilayotgan CDN domenlaringizni shu yerga
      // aniq qo'shamiz.
      {
        protocol: "https",
        hostname: "cdn.inkly.uz",
      },

      // Agar API serverdan image serve qilinsa:
      {
        protocol: "https",
        hostname: "api.inkly.uz",
      },

      // Development
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },

  // ============================================================
  // REDIRECTS
  // ============================================================

  async redirects() {
    return [
      {
        source: "/explore",
        destination: "/posts",
        permanent: true,
      },
    ]
  },

  // ============================================================
  // REWRITES
  // ============================================================

  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/:username",
      },
      {
        source: "/@:username/:slug",
        destination: "/:username/:slug",
      },
    ]
  },

  // ============================================================
  // SECURITY + CACHE HEADERS
  // ============================================================

  async headers() {
    return [
      // ----------------------------------------------------------
      // GLOBAL SECURITY HEADERS
      // ----------------------------------------------------------

      {
        source: "/(.*)",
        headers: [
          // Prevent MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // Clickjacking protection
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // Control Referer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },

      // ----------------------------------------------------------
      // STATIC ICON CACHE
      // ----------------------------------------------------------

      {
        source: "/icon.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },

      {
        source: "/icon-light-32x32.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },

      {
        source: "/icon-dark-32x32.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },

      {
        source: "/apple-icon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },

      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, immutable",
          },
        ],
      },

      // ----------------------------------------------------------
      // SERVICE WORKER — HECH QACHON KESHLANMASIN
      // ----------------------------------------------------------
      // sw.js o'zi keshlansa, brauzer eski (buggy) versiyani uzoq vaqt
      // ishlatib turishi mumkin — yangilanishni har doim darhol tekshirsin.
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ]
  },
}

export default nextConfig