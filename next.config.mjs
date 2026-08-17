/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
