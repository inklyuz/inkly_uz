// lib/theme/accent.ts
//
// Butun profil sahifasi (mobil + desktop) uchun BITTA rang manbai.
// Qiymat AvatarGlow tomonidan o'rnatiladigan --glow-r/g/b CSS
// o'zgaruvchilariga tayanadi (avatar rasmidan chiqarilgan dominant rang).
// Agar ota-komponent AvatarGlow bilan o'ralmagan bo'lsa yoki avatar yo'q
// bo'lsa, fallback sifatida brend rangi (var(--color-inkly-orange) ga mos
// 255,140,60) ishlatiladi.

export const ACCENT_COLOR = "rgb(var(--glow-r, 255), var(--glow-g, 140), var(--glow-b, 60))"
export const ACCENT_COLOR_SOFT = "rgba(var(--glow-r, 255), var(--glow-g, 140), var(--glow-b, 60), 0.65)"
export const ACCENT_COLOR_BG = "rgba(var(--glow-r, 255), var(--glow-g, 140), var(--glow-b, 60), 0.08)"
export const ACCENT_COLOR_BORDER = "rgba(var(--glow-r, 255), var(--glow-g, 140), var(--glow-b, 60), 0.35)"
