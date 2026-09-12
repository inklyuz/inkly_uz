import { redirect } from "next/navigation"

// Server component redirect — SSR-safe, useEffect kerak emas.
// Avvalgi "use client" + useRouter + useEffect variant server renderda
// flakerlik qilishi mumkin edi (hydration mismatches).
//
// MUHIM: query paramlarni (masalan ?edit=uuid) saqlab qolish kerak,
// aks holda "Tahrirlash" tugmasi doim bo'sh/yangi editor ochib yuboradi.
export default async function WriteEntryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, v))
    else qs.append(key, value)
  }
  const suffix = qs.toString()
  redirect(`/write/editor${suffix ? `?${suffix}` : ""}`)
}
