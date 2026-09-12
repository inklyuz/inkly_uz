import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inkly.uz"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/dashboard/*",
        "/write",
        "/write/*",
        "/telegram",
        "/telegram/*",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/google/*",
        "/telegram-bot/*",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}