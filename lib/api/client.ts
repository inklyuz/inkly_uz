export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1"
const TOKEN_KEY = "inkly_token"

function getTokenStorage(): Storage | null {
  if (typeof window === "undefined") return null
  return sessionStorage
}

function setStoredToken(token: string): void {
  const storage = getTokenStorage()
  if (storage) storage.setItem(TOKEN_KEY, token)
}

function clearStoredToken(): void {
  const storage = getTokenStorage()
  if (storage) storage.removeItem(TOKEN_KEY)
}

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

// Backend response format:
// Muvaffaqiyat: { success: true, message: string, data: T }
// Xatolik:      { success: false, error: { code: string, message: string, details?: object } }
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

  // Response validation using zod
  const { validateApiResponse } = await import("./schemas")
  const validated = validateApiResponse<T>(json)

  if (!validated.success) {
    const code = validated.code ?? "UNKNOWN_ERROR"
    const message = validated.message ?? "Noma'lum xatolik yuz berdi"

    // 401: mark the stored access token invalid. Route-level redirect belongs
    // to AuthProvider/ProtectedRoute so callback and public pages don't loop.
    if (code === "UNAUTHORIZED" && !_retry && typeof window !== "undefined") {
      clearStoredToken()
      throw new ApiRequestError("SESSION_EXPIRED", "Iltimos, qayta kiring")
    }

    throw new ApiRequestError(code, message, validated.details ?? null)
  }

  return validated.data as T
}

// ── Multipart upload (rasm yuklash) ──────────────────────────────────────────
export async function uploadFile<T>(path: string, file: File, fieldName: string, token: string): Promise<T> {
  const form = new FormData()
  form.append(fieldName, file)

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      credentials: "include",
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

  const { validateApiResponse } = await import("./schemas")
  const validated = validateApiResponse<T>(json)

  if (!validated.success) {
    throw new ApiRequestError(
      validated.code ?? "UPLOAD_FAILED",
      validated.message ?? "Yuklab bo'lmadi",
      validated.details ?? null,
    )
  }

  return validated.data as T
}
