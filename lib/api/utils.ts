/**
 * Sahifalash (pagination) uchun query string qurilmasi.
 * users.ts va posts.ts da takrorlangan edi — markazlashtirildi.
 */
export function buildPageQuery(params: { page?: number; page_size?: number }): string {
  const q = new URLSearchParams()
  if (params.page !== undefined)      q.set("page",      String(params.page))
  if (params.page_size !== undefined) q.set("page_size", String(params.page_size))
  const qs = q.toString()
  return qs ? `?${qs}` : ""
}
