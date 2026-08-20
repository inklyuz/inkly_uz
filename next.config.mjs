/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
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
  async rewrites() {
    return [
      // /@username → /username (ichki rewrite, URL o'zgarmaydi)
      {
        source: "/@:username",
        destination: "/:username",
      },
      // /@username/slug → /username/slug
      {
        source: "/@:username/:slug",
        destination: "/:username/:slug",
      },
    ]
  },
}
export default nextConfig
