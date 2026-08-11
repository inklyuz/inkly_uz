const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
]

/** "9 avgust 2026" */
export function formatDate(date: string): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getUTCDate()} ${UZ_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "3 kun oldin" */
export function timeAgo(date: string, now: Date = new Date()): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ""
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (seconds < 60) return "hozir"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} daqiqa oldin`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} soat oldin`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} kun oldin`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} oy oldin`
  return `${Math.floor(months / 12)} yil oldin`
}

/** O'qish vaqti (taxminan) */
export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} daqiqa`
}

/** Raqamni qisqartirish: 1240 → "1.2k" */
export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/** Ism bo'yicha initsiallar: "Sardor Yo'ldoshev" → "SY" */
export function initials(name?: string | null): string {
  if (!name) return "?"
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
