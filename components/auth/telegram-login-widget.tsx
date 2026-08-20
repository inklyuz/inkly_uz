"use client"

import { useEffect, useRef, useState } from "react"
import { authApi } from "@/lib/api/auth"
import { useAuth } from "@/lib/auth/context"

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface TelegramLoginWidgetProps {
  onSuccess: () => void
  onError?: () => void
}

function AlertCircleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

export function TelegramLoginWidget({
  onSuccess,
  onError,
}: TelegramLoginWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const handledRef = useRef(false)
  const mountedRef = useRef(false)

  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  const { login } = useAuth()

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  useEffect(() => {
    mountedRef.current = true
    handledRef.current = false

    const callbackName = `onTelegramAuth_${Math.random()
      .toString(36)
      .slice(2)}`

    const telegramWindow = window as unknown as Record<
      string,
      (user: TelegramAuthData) => void
    >

    const cleanup = () => {
      window.clearTimeout(timeoutId)

      delete telegramWindow[callbackName]

      if (containerRef.current) {
        containerRef.current.replaceChildren()
      }
    }

    const fireError = () => {
      if (!mountedRef.current) return
      if (handledRef.current) return

      cleanup()

      onErrorRef.current?.()
    }

    const handleAuth = async (
      userData: TelegramAuthData,
    ) => {
      if (!mountedRef.current) return
      if (handledRef.current) return

      handledRef.current = true

      window.clearTimeout(timeoutId)

      setError(null)
      setLoading(true)

      try {
        const { tokens } =
          await authApi.telegramLogin({
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name ?? null,
            username: userData.username ?? null,
            photo_url: userData.photo_url ?? null,
            auth_date: userData.auth_date,
            hash: userData.hash,
          })

        if (!mountedRef.current) return

        await login(tokens)

        if (!mountedRef.current) return

        onSuccessRef.current()
      } catch (err) {
        if (!mountedRef.current) return

        handledRef.current = false

        setError(
          err instanceof Error
            ? err.message
            : "Telegram orqali kirishda xatolik yuz berdi",
        )
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    telegramWindow[callbackName] = handleAuth

    const script = document.createElement("script")

    script.src =
      "https://telegram.org/js/telegram-widget.js?22"

    script.async = true

    /*
     * MUHIM:
     *
     * BotFather'dagi username aynan shu bo'lishi kerak.
     *
     * @ belgisi yozilmaydi.
     *
     * Masalan:
     * @inkly_uz_bot
     *
     * => inkly_uz_bot
     */
    script.setAttribute(
      "data-telegram-login",
      "inkly_uz_bot",
    )

    script.setAttribute(
      "data-size",
      "large",
    )

    script.setAttribute(
      "data-radius",
      "10",
    )

    script.setAttribute(
      "data-onauth",
      `${callbackName}(user)`,
    )

    script.setAttribute(
      "data-request-access",
      "write",
    )

    /*
     * Telegram widget script yuklanmasa
     * fallbackga o'tamiz.
     */
    script.onerror = () => {
      fireError()
    }

    /*
     * Container'ni tozalab,
     * yangi Telegram widget qo'yamiz.
     */
    if (containerRef.current) {
      containerRef.current.replaceChildren()
      containerRef.current.appendChild(script)
    }

    /*
     * MUHIM:
     *
     * Telegram widget iframe cross-origin.
     *
     * Shuning uchun:
     *
     * iframe.textContent
     * container.textContent
     *
     * orqali "Username invalid"ni
     * o'qib bo'lmaydi.
     *
     * Callback kelmasa fallback ishlaydi.
     */
    const timeoutId = window.setTimeout(() => {
      if (!mountedRef.current) return
      if (handledRef.current) return

      fireError()
    }, 3500)

    return () => {
      mountedRef.current = false

      window.clearTimeout(timeoutId)

      delete telegramWindow[callbackName]

      if (containerRef.current) {
        containerRef.current.replaceChildren()
      }
    }
  }, [login])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        width: "100%",
      }}
    >
      <div
        ref={containerRef}
        aria-busy={loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: 48,
        }}
      />

      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <svg
            className="animate-spin"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#29B6F6"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>

          <span
            style={{
              fontSize: 13,
              color: "#9CA3AF",
            }}
          >
            Tekshirilmoqda…
          </span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 7,
            width: "100%",
            padding: "9px 12px",
            borderRadius: 10,
            background: "#FFF3E8",
            border:
              "1px solid rgba(255,106,0,0.28)",
            color: "#C94F00",
            fontSize: 12,
            boxSizing: "border-box",
          }}
        >
          <AlertCircleIcon size={13} />

          <span
            style={{
              lineHeight: 1.5,
            }}
          >
            {error}
          </span>
        </div>
      )}
    </div>
  )
}