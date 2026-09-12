/**
 * Teletype'dan keladigan <document> formatidagi XML/HTML ni
 * bizning TipTap va tizimimiz tushunadigan standart HTML formatiga o'zgartiradi.
 *
 * XSS himoya uchun sanitize-html bilan sanitizatsiya qilinadi.
 */

import sanitizeHtml from "sanitize-html"

import { getMediaUrl } from "@/lib/api/client"

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "code",
  "pre",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "div",
  "span",
  "hr",
  "b",
  "i",
]

const ALLOWED_ATTR: Record<string, string[]> = {
  "*": ["class", "id"],
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title"],
}

export function parseTeletypeToHtml(text: string): string {
  if (!text) return ""

  let html = text

  // 1. <document> tagini standart div'ga o'tkazish
  html = html.replace(
    /<document>/gi,
    '<div class="teletype-content">',
  )

  html = html.replace(
    /<\/document>/gi,
    "</div>",
  )

  // 2. <image src="..."><caption>...</caption></image>
  //    -> <figure><img ...><figcaption>...</figcaption></figure>
  html = html.replace(
    /<image([^>]*)>([\s\S]*?)<\/image>/gi,
    (_match, attrs: string, content: string) => {
      const srcMatch = attrs.match(/src=["']([^"']+)["']/i)
      const src = srcMatch?.[1] ?? ""

      const captionMatch = content.match(
        /<caption>([\s\S]*?)<\/caption>/i,
      )

      const captionText = captionMatch?.[1]?.trim() ?? ""

      const caption = captionText
        ? `<figcaption>${captionText}</figcaption>`
        : ""

      return `<figure><img src="${src}" alt="Image" />${caption}</figure>`
    },
  )

  // 3. <pre> ni <pre><code> formatiga o'tkazish
  html = html.replace(
    /<pre([^>]*)>([\s\S]*?)<\/pre>/gi,
    (match, attrs: string, content: string) => {
      if (/<code\b/i.test(content)) {
        return match
      }

      return `<pre${attrs}><code>${content}</code></pre>`
    },
  )

  // 4. Teletype'ning keraksiz anchor atributini olib tashlash
  html = html.replace(/\sanchor=["'][^"']*["']/gi, "")

  // 5. XSS sanitizatsiya
  const sanitized = sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,

    // Faqat xavfsiz protokollar
    allowedSchemes: ["http", "https", "mailto"],

    // data: URL orqali XSS/media bypass bo'lmasin
    allowProtocolRelative: false,

    // Inline style'ni ataylab ruxsat bermaymiz
    allowedStyles: {},

    // Script/event handler va boshqa xavfli atributlar
    // default bo'yicha olib tashlanadi.

    transformTags: {
      a: (_tagName, attribs) => {
        const href = attribs.href ?? ""
        const isExternal = /^https?:\/\//i.test(href)

        return {
          tagName: "a",
          attribs: {
            ...attribs, 
            ...(isExternal
              ? {
                  target: "_blank",
                  rel: "noopener noreferrer nofollow",
                }
              : {}),
          },
        }
      },
    },
  })

  // 6. Relative media path'larni absolute API URL'ga o'tkazish
  return sanitized.replace(
    /(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi,
    (_match, prefix: string, src: string, suffix: string) => {
      const mediaUrl = getMediaUrl(src)

      return `${prefix}${mediaUrl ?? src}${suffix}`
    },
  )
}