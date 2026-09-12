"use client"

import { useEffect, useState } from "react"

interface AvatarGlowProps {
  avatarUrl: string
  children: React.ReactNode
}

interface Rgb {
  r: number
  g: number
  b: number
}

// Boshlang'ich / fallback rang — avatar bo'lmaganda, hali yuklanmaganda
// yoki rasmdan rang chiqarib bo'lmaganda (masalan CORS) ishlatiladi.
// app/globals.css dagi --color-inkly-orange (#FF6A00) bilan bir xil.
const FALLBACK_RGB: Rgb = { r: 255, g: 106, b: 0 }

/**
 * Banner/hero uchun aksent rang HAR BIR foydalanuvchining o'z avatar
 * rasmidan (dominant/eng to'yingan rangidan) hisoblanadi. --glow-r/g/b
 * CSS o'zgaruvchilari (rgb komponentlari alohida-alohida) shu yerda BIR
 * MARTA o'rnatiladi va bolalarga (banner, follow tugmasi, statistikalar,
 * ikonalar — lib/theme/accent.ts orqali) meros bo'lib tushadi.
 *
 * Agar avatar bo'lmasa yoki rasm boshqa origin'da joylashgani uchun
 * canvas orqali o'qib bo'lmasa (tainted canvas / CORS xatosi), rang
 * FALLBACK_RGB (brend rangi) da qoladi.
 */
export function AvatarGlow({ avatarUrl, children }: AvatarGlowProps) {
  const [rgb, setRgb] = useState<Rgb>(FALLBACK_RGB)

  useEffect(() => {
    if (!avatarUrl) {
      setRgb(FALLBACK_RGB)
      return
    }

    let cancelled = false
    const img = new window.Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      if (cancelled) return
      try {
        const extracted = extractDominantColor(img)
        setRgb(extracted ?? FALLBACK_RGB)
      } catch {
        // Canvas "tainted" bo'lib qolishi mumkin — CDN CORS header
        // bermasa getImageData xato beradi. Bunda jim fallback qilamiz.
        setRgb(FALLBACK_RGB)
      }
    }

    img.onerror = () => {
      if (!cancelled) setRgb(FALLBACK_RGB)
    }

    img.src = avatarUrl

    return () => {
      cancelled = true
    }
  }, [avatarUrl])

  const style = {
    "--glow-r": rgb.r,
    "--glow-g": rgb.g,
    "--glow-b": rgb.b,
  } as React.CSSProperties

  return (
    <div className="contents" style={style}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Dominant rang hisoblash
// ─────────────────────────────────────────────────────────────────────────

/**
 * Rasmni kichik canvas'ga chizib, piksellarni o'rtachalaydi — lekin
 * to'yingan (saturated) piksellarga ko'proq og'irlik beradi, deyarli
 * oq/kulrang/qora fon piksellariga esa kamroq. Shu bilan natija "loyqa
 * kulrang o'rtacha" emas, avatardagi haqiqiy aksent rangga yaqinroq bo'ladi.
 */
function extractDominantColor(img: HTMLImageElement): Rgb | null {
  const SAMPLE_SIZE = 32 // kichik canvas — tez va yetarli aniqlikda

  const canvas = document.createElement("canvas")
  canvas.width = SAMPLE_SIZE
  canvas.height = SAMPLE_SIZE

  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

  // Rasm boshqa origin'dan va CDN CORS header bermasa, shu qator
  // SecurityError otadi — chaqiruvchi try/catch bilan ushlaydi.
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

  let r = 0
  let g = 0
  let b = 0
  let weight = 0

  for (let i = 0; i < data.length; i += 4) {
    const pr = data[i]
    const pg = data[i + 1]
    const pb = data[i + 2]
    const alpha = data[i + 3]
    if (alpha < 128) continue // shaffof piksellarni hisobga olmaymiz

    const max = Math.max(pr, pg, pb)
    const min = Math.min(pr, pg, pb)
    const saturation = max === 0 ? 0 : (max - min) / max

    // Deyarli oq/qora/kulrang piksellar kam og'irlik oladi (0.15 baza),
    // to'yingan piksellar esa saturation^2 ga ko'ra ko'proq ta'sir qiladi.
    const w = 0.15 + saturation * saturation

    r += pr * w
    g += pg * w
    b += pb * w
    weight += w
  }

  if (weight === 0) return null

  return {
    r: Math.round(r / weight),
    g: Math.round(g / weight),
    b: Math.round(b / weight),
  }
}