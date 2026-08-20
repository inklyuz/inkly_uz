/**
 * Unified safe-wrapper for API calls in server components (RSC).
 * Provides consistent error handling, logging, and fallback values.
 */

import { ApiRequestError } from "./client"

type SafeResult<T> = T | null
type SafePageResult<T> = { items: T[]; total: number; page: number; page_size: number; total_pages: number }

interface SafeOptions {
  /** Log errors in development (default: true) */
  logErrors?: boolean
  /** Custom fallback value (default: null or empty page) */
  fallback?: unknown
  /** Custom error message prefix */
  errorPrefix?: string
}

/**
 * Creates a safe version of an async function that catches errors
 * and returns a fallback value instead of throwing.
 *
 * @param fn - The async function to wrap
 * @param fallback - Fallback value to return on error
 * @param options - Additional options for error handling
 *
 * @example
 * ```ts
 * const safeGetUser = createSafeWrapper(usersApi.getPublic, null)
 * const user = await safeGetUser("username")
 * // user is UserPublicResponse | null
 * ```
 */
export function createSafeWrapper<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  fallback: TResult | (() => TResult),
  options: SafeOptions = {}
) {
  const { logErrors = true, errorPrefix = "API" } = options

  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await fn(...args)
    } catch (error) {
      if (logErrors && process.env.NODE_ENV !== "production") {
        const prefix = errorPrefix ? `[${errorPrefix}]` : ""
        console.error(`${prefix} ${fn.name || "anonymous"} error:`, error)
      }

      // Return fallback value
      return typeof fallback === "function" ? (fallback as () => TResult)() : fallback
    }
  }
}

/**
 * Creates a safe wrapper for list endpoints that return paginated results.
 * Returns an empty page structure on error.
 */
export function createSafePageWrapper<TItem, TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<{ items: TItem[]; total: number; page: number; page_size: number; total_pages: number }>,
  defaultPageSize = 20,
  options: SafeOptions = {}
) {
  return createSafeWrapper(
    fn,
    () => ({
      items: [] as TItem[],
      total: 0,
      page: 1,
      page_size: defaultPageSize,
      total_pages: 0,
    }),
    options
  )
}

/**
 * Creates a safe wrapper for single item endpoints.
 * Returns null on error.
 */
export function createSafeItemWrapper<TItem, TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<TItem>,
  options: SafeOptions = {}
) {
  return createSafeWrapper(fn, null as TItem | null, options)
}

/**
 * Specialized safe wrappers for common API patterns.
 * These provide typed fallbacks for specific return types.
 */

// For paginated lists (Page<T>)
export function safeList<TItem>(
  fn: () => Promise<{ items: TItem[]; total: number; page: number; page_size: number; total_pages: number }>,
  pageSize = 20
) {
  return createSafePageWrapper(fn, pageSize, { errorPrefix: "LIST" })
}

// For single item fetches
export function safeGet<TItem>(fn: () => Promise<TItem>) {
  return createSafeItemWrapper(fn, { errorPrefix: "GET" })
}

// For mutations that return void
export function safeVoid(fn: () => Promise<void>) {
  return createSafeWrapper(fn, undefined, { errorPrefix: "MUTATION" })
}

/**
 * Higher-order function to add safe variants to an API object.
 * Usage:
 * ```ts
 * const postsApi = {
 *   list: ...,
 *   get: ...,
 * }
 *
 * export const postsApiSafe = addSafeVariants(postsApi, {
 *   list: { pageSize: 20 },
 *   get: {},
 * })
 * ```
 */
export function addSafeVariants<T extends Record<string, (...args: any[]) => Promise<any>>>(
  api: T,
  config: Record<keyof T, { pageSize?: number; type?: "list" | "item" | "void" }>
) {
  const safeApi = { ...api } as T & { [K in keyof T as `safe${Capitalize<string & K>}`]: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>> }

  for (const [key, cfg] of Object.entries(config)) {
    const fn = api[key]
    const safeKey = `safe${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof safeApi

    if (cfg.type === "list" || cfg.type === undefined) {
      // For list type or when explicitly specified
      ;(safeApi as any)[safeKey] = createSafePageWrapper(fn, cfg.pageSize ?? 20, { errorPrefix: key.toUpperCase() })
    } else if (cfg.type === "void") {
      ;(safeApi as any)[safeKey] = createSafeVoidWrapper(fn, { errorPrefix: key.toUpperCase() })
    } else {
      ;(safeApi as any)[safeKey] = createSafeItemWrapper(fn, { errorPrefix: key.toUpperCase() })
    }
  }

  return safeApi
}

/**
 * Safe wrapper for void-returning functions (mutations)
 */
function createSafeVoidWrapper<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<void>,
  options: SafeOptions = {}
) {
  return createSafeWrapper(fn, undefined, options)
}

/**
 * React hook for safe data fetching in client components.
 * Provides loading, error, and data states.
 *
 * @example
 * ```tsx
 * function UserProfile({ username }: { username: string }) {
 *   const { data, error, loading, refetch } = useSafeApi(
 *     () => usersApi.getPublic(username),
 *     [username]
 *   )
 *
 *   if (loading) return <Skeleton />
 *   if (error) return <ErrorMessage message={error.message} />
 *   if (!data) return <NotFound />
 *
 *   return <Profile user={data} />
 * }
 * ```
 */
export function useSafeApi<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList
): { data: T | null; error: ApiRequestError | null; loading: boolean; refetch: () => Promise<void> } {
  // This would be implemented with useState/useEffect in a client component
  // For now, we're just exporting the type signature
  // Implementation would go in a separate hooks file
  throw new Error("useSafeApi must be implemented in a client component file")
}

/**
 * Utility to check if an error is a network/auth error that should trigger a redirect
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.code === "SESSION_EXPIRED"
}

/**
 * Utility to check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.code === "NETWORK_ERROR"
}

/**
 * Utility to extract user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return "Noma'lum xatolik yuz berdi"
}