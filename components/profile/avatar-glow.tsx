"use client"

interface AvatarGlowProps {
  avatarUrl: string
  children: React.ReactNode
}

/**
 * Banner/hero uchun aksent rang endi HAR BIR foydalanuvchi avatari rasmidan
 * emas — logotipning brend rangidan (--color-inkly-orange, app/globals.css)
 * olinadi. Shunday qilib butun sayt bo'ylab banner har doim logo bilan bir
 * xil rangda bo'ladi, foydalanuvchi qanday avatar qo'ymasidan qat'iy nazar.
 *
 * --glow-r/g/b CSS o'zgaruvchilari (rgb komponentlari alohida-alohida)
 * global.css'dagi --color-inkly-orange (#FF6A00) qiymatiga mos, shu bilan
 * ProfileBanner'dagi fallback qiymat bilan ham aynan bir xil.
 */
const LOGO_GLOW_RGB = { r: 255, g: 106, b: 0 } // #FF6A00 — --color-inkly-orange bilan bir xil

export function AvatarGlow({ children }: AvatarGlowProps) {
  const style = {
    "--glow-r": LOGO_GLOW_RGB.r,
    "--glow-g": LOGO_GLOW_RGB.g,
    "--glow-b": LOGO_GLOW_RGB.b,
  } as React.CSSProperties

  return (
    <div className="contents" style={style}>
      {children}
    </div>
  )
}