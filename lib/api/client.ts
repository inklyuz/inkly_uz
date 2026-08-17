export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1"
const TOKEN_KEY = "inkly_token"

export class ApiRequestError extends Error {
  code: string
  details: Record<string, unknown> | null

  constructor(code: string, message: string, details: Record<string, unknown> | null = null) {
    super(message)
    this.name = "ApiRequestError"
    this.code = code
    this.details = details
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  token?: string
  headers?: Record<string, string>
  /** Server component caching — soniyada */
  revalidate?: number
  /** Ichki: token yangilanganidan keyin qayta urinish belgisi */
  _retry?: boolean
}

// ── Token yangilash — race condition oldini olish ────────────────────────────
let isRefreshing = false
type QueueItem = { resolve: (token: string) => void; reject: (err: unknown) => void }
let failedQueue: QueueItem[] = []

function flushQueue(token: string | null, err: unknown = null) {
  failedQueue.forEach((item) => (token ? item.resolve(token) : item.reject(err)))
  failedQueue = []
}

async function refreshAccessToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    credentials: "include",
  })
  const json = (await res.json()) as { success?: boolean; data?: { tokens?: { access_token?: string } } }
  const newToken = json?.data?.tokens?.access_token
  if (!newToken) throw new ApiRequestError("SESSION_EXPIRED", "Sessiya muddati tugadi")
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, newToken)
  return newToken
}

// Backend response format:
// Muvaffaqiyat: { success: true, message: string, data: T }
// Xatolik:      { success: false, code: string, message: string, details?: object }
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers = {}, revalidate, _retry } = options

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }
  if (token) reqHeaders["Authorization"] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      ...(typeof revalidate === "number" ? { next: { revalidate } } : {}),
    })
  } catch {
    throw new ApiRequestError("NETWORK_ERROR", "Serverga ulanib bo'lmadi")
  }

  let json: unknown
  try {
    json = await res.json()
  } catch {
    throw new ApiRequestError("INVALID_RESPONSE", "Serverdan noto'g'ri javob keldi")
  }

  const payload = json as {
    success?: boolean
    data?: T
    message?: string
    code?: string
    details?: Record<string, unknown>
  }

  if (!payload?.success) {
    const code = payload?.code ?? "UNKNOWN_ERROR"
    const message = payload?.message ?? "Noma'lum xatolik yuz berdi"

    // 401 → token yangilash va qayta urinish (faqat client-side va birinchi urinishda)
    if (
      code === "UNAUTHORIZED" &&
      !_retry &&
      typeof window !== "undefined"
    ) {
      if (isRefreshing) {
        // Boshqa so'rovlar refresh tugashini kutadi
        return new Promise<T>((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken) =>
              resolve(apiRequest<T>(path, { ...options, token: newToken, _retry: true })),
            reject,
          })
        })
      }

      isRefreshing = true
      try {
        const newToken = await refreshAccessToken()
        flushQueue(newToken)
        return await apiRequest<T>(path, { ...options, token: newToken, _retry: true })
      } catch (refreshErr) {
        flushQueue(null, refreshErr)
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEY)
          window.location.href = "/login"
        }
        throw new ApiRequestError("SESSION_EXPIRED", "Iltimos, qayta kiring")
      } finally {
        isRefreshing = false
      }
    }

    throw new ApiRequestError(code, message, payload?.details ?? null)
  }

  return payload.data as T
}

// ── Multipart upload (rasm yuklash) ──────────────────────────────────────────
export async function uploadFile<T>(path: string, file: File, fieldName: string, token: string): Promise<T> {
  const form = new FormData()
  form.append(fieldName, file)

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    credentials: "include",
  })

  const json = (await res.json()) as {
    success?: boolean
    data?: T
    code?: string
    message?: string
  }

  if (!json?.success) {
    throw new ApiRequestError(
      json?.code ?? "UPLOAD_FAILED",
      json?.message ?? "Yuklab bo'lmadi",
    )
  }

  return json.data as T
}