export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1"

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
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers = {}, revalidate } = options

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

  const payload = json as { success?: boolean; data?: T; error?: { code: string; message: string; details: null } }

  if (!payload?.success) {
    throw new ApiRequestError(
      payload?.error?.code ?? "UNKNOWN_ERROR",
      payload?.error?.message ?? "Nomaʼlum xatolik yuz berdi",
      payload?.error?.details ?? null,
    )
  }

  return payload.data as T
}

// ── Multipart upload (rasm) ────────────────────────────────────────────────
export async function uploadFile<T>(path: string, file: File, fieldName: string, token: string): Promise<T> {
  const form = new FormData()
  form.append(fieldName, file)

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    credentials: "include",
  })

  const json = (await res.json()) as { success?: boolean; data?: T; error?: { code: string; message: string } }
  if (!json?.success) {
    throw new ApiRequestError(json?.error?.code ?? "UPLOAD_FAILED", json?.error?.message ?? "Yuklab bo'lmadi")
  }
  return json.data as T
}

/**
 * Backend hali ishga tushmagan bo'lsa ham sahifa bo'sh qolmasligi uchun:
 * real API ishlamasa demo kontentga qaytadi.
 */
export async function withFallback<T>(request: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await request()
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[v0] API fallback:", (error as Error)?.message)
    }
    return fallback
  }
}
