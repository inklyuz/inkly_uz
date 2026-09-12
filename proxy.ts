import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COMING_SOON = false

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/write",
  "/telegram",
]

const REFRESH_COOKIE_NAME = "inkly_refresh"

function buildCsp(isDev: boolean): string {
  const directives = [
    "default-src 'self'",

    // Framer Motion va Next.js runtime'i inline <style>/<script>
    // orqali ishlaydi. Bu loyihada nonce hech qayerda
    // (app/layout.tsx) o'qilmagani uchun nonce+unsafe-inline
    // kombinatsiyasi CSP3 brauzerlarida unsafe-inline'ni
    // e'tiborsiz qoldiradi — shuning uchun nonce'siz, faqat
    // unsafe-inline bilan qoldiramiz.
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,

    // Next.js / React styles
    "style-src 'self' 'unsafe-inline'",

    // Images
    "img-src 'self' data: blob: https:",

    // Fonts
    "font-src 'self' data: https:",

    // API / WebSocket
    "connect-src 'self' https: wss:",

    // Audio/video
    "media-src 'self' https: blob:",

    // Embedded video
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",

    // Plugins
    "object-src 'none'",

    // Base URL manipulation
    "base-uri 'self'",

    // Form submissions
    "form-action 'self'",

    // Clickjacking
    "frame-ancestors 'none'",

    // HTTPS
    "upgrade-insecure-requests",
  ]

  return directives.join("; ")
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isDev = process.env.NODE_ENV === "development"
  const csp = buildCsp(isDev)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("Content-Security-Policy", csp)

  // Static/API/internal resources
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    response.headers.set("Content-Security-Policy", csp)

    return response
  }

  // COMING_SOON
  if (COMING_SOON) {
    if (pathname !== "/") {
      return NextResponse.redirect(
        new URL("/?coming_soon=1", request.url),
      )
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    response.headers.set("Content-Security-Policy", csp)

    return response
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(`${prefix}/`),
  )

  if (!isProtected) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    response.headers.set("Content-Security-Policy", csp)

    return response
  }

  const hasRefreshToken = request.cookies.has(
    REFRESH_COOKIE_NAME,
  )

  if (!hasRefreshToken) {
    const loginUrl = new URL("/login", request.url)

    loginUrl.searchParams.set(
      "next",
      pathname,
    )

    return NextResponse.redirect(loginUrl)
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.headers.set(
    "Content-Security-Policy",
    csp,
  )

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}