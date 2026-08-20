"use client"

import { useState, useCallback } from "react"
import { authApi } from "@/lib/api/auth"
import { TelegramLoginWidget } from "@/components/auth/telegram-login-widget"

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />

      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />

      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />

      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="white"
      aria-hidden="true"
    >
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  )
}

function SpinnerIcon({
  color = "currentColor",
}: {
  color?: string
}) {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function AlertCircleIcon({
  size = 14,
}: {
  size?: number
}) {
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

      <line
        x1="12"
        y1="8"
        x2="12"
        y2="12"
      />

      <line
        x1="12"
        y1="16"
        x2="12.01"
        y2="16"
      />
    </svg>
  )
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export function AuthMethods({
  onTelegramSuccess,
}: {
  onTelegramSuccess?: () => void
}) {
  const [error, setError] = useState<string | null>(null)

  const [googleLoading, setGoogleLoading] =
    useState(false)

  const [botLoading, setBotLoading] =
    useState(false)

  const [botLink, setBotLink] =
    useState<string | null>(null)

  const [botExpiresAt, setBotExpiresAt] =
    useState<string | null>(null)

  /*
   * Telegram widget ishlamasa true bo'ladi.
   *
   * true:
   *   Widget yashiriladi
   *   Bot login tugmasi chiqadi
   */
  const [widgetFailed, setWidgetFailed] =
    useState(false)

  // ─────────────────────────────────────────────
  // TELEGRAM WIDGET ERROR
  // ─────────────────────────────────────────────

  const handleWidgetError = useCallback(() => {
    setWidgetFailed(true)
    setError(null)
  }, [])

  // ─────────────────────────────────────────────
  // TELEGRAM WIDGET SUCCESS
  // ─────────────────────────────────────────────

  const handleTelegramSuccess = useCallback(() => {
    onTelegramSuccess?.()
  }, [onTelegramSuccess])

  // ─────────────────────────────────────────────
  // GOOGLE
  // ─────────────────────────────────────────────

  async function continueWithGoogle() {
    if (googleLoading) return

    setError(null)
    setGoogleLoading(true)

    try {
      const response =
        await authApi.getGoogleUrl()

      window.location.assign(
        response.authorization_url,
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google orqali kirishda xatolik yuz berdi",
      )

      setGoogleLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // TELEGRAM BOT
  // ─────────────────────────────────────────────

  async function continueWithTelegramBot() {
    if (botLoading) return

    setError(null)

    setBotLoading(true)

    setBotLink(null)
    setBotExpiresAt(null)

    try {
      const response =
        await authApi.telegramBotStart()

      /*
       * Backend deep_link qaytarishi kerak.
       */
      if (!response.deep_link) {
        throw new Error(
          "Telegram bot uchun havola yaratilmadi",
        )
      }

      setBotLink(response.deep_link)

      setBotExpiresAt(
        response.expires_at,
      )

      /*
       * Telegramni yangi tab/window'da ochamiz.
       */
      window.open(
        response.deep_link,
        "_blank",
        "noopener,noreferrer",
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bot orqali kirish havolasini yaratib bo‘lmadi",
      )
    } finally {
      setBotLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* GLOBAL ERROR */}

      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            background: "#FFF3E8",
            border:
              "1px solid rgba(255,106,0,0.28)",
            borderRadius: 12,
            padding: "10px 14px",
            color: "#C94F00",
            fontSize: 13,
          }}
        >
          <AlertCircleIcon size={15} />

          <span>{error}</span>
        </div>
      )}

      {/* GOOGLE */}

      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={googleLoading}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "13px 20px",
          borderRadius: 14,
          background: "#ffffff",
          border: "1.5px solid #D1D5DB",
          color: "#1F1F1F",
          fontSize: 15,
          fontWeight: 600,
          cursor: googleLoading
            ? "not-allowed"
            : "pointer",
          opacity: googleLoading ? 0.65 : 1,
          transition:
            "border-color 0.15s, box-shadow 0.15s, background 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!googleLoading) {
            e.currentTarget.style.borderColor =
              "#4285F4"

            e.currentTarget.style.boxShadow =
              "0 0 0 3px rgba(66,133,244,0.12)"

            e.currentTarget.style.background =
              "#F8FBFF"
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor =
            "#D1D5DB"

          e.currentTarget.style.boxShadow =
            "none"

          e.currentTarget.style.background =
            "#ffffff"
        }}
      >
        {googleLoading ? (
          <SpinnerIcon color="#4285F4" />
        ) : (
          <GoogleIcon />
        )}

        {googleLoading
          ? "Google'ga ulanmoqda…"
          : "Google orqali kirish"}
      </button>

      {/* TELEGRAM */}

      {!widgetFailed ? (
        <TelegramLoginWidget
          onSuccess={handleTelegramSuccess}
          onError={handleWidgetError}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* BOT LOGIN BUTTON */}

          <button
            type="button"
            onClick={continueWithTelegramBot}
            disabled={botLoading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "13px 20px",
              borderRadius: 14,
              background: "#29B6F6",
              border:
                "1.5px solid #0BB5E8",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 600,
              cursor: botLoading
                ? "not-allowed"
                : "pointer",
              opacity: botLoading ? 0.65 : 1,
              transition:
                "background 0.15s, box-shadow 0.15s",
              boxShadow:
                "0 2px 10px rgba(41,182,246,0.30)",
            }}
            onMouseEnter={(e) => {
              if (!botLoading) {
                e.currentTarget.style.background =
                  "#0EA5E9"

                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(41,182,246,0.40)"
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "#29B6F6"

              e.currentTarget.style.boxShadow =
                "0 2px 10px rgba(41,182,246,0.30)"
            }}
          >
            {botLoading ? (
              <SpinnerIcon color="white" />
            ) : (
              <TelegramIcon />
            )}

            {botLoading
              ? "Havola yaratilmoqda…"
              : "Telegram bot orqali kirish"}
          </button>

          {/* BOT LINK */}

          {botLink && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                padding: "10px 14px",
                background: "#F0F9FF",
                border:
                  "1px solid #BAE6FD",
                borderRadius: 12,
              }}
            >
              <a
                href={botLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0369A1",
                  textDecoration: "none",
                }}
              >
                Telegram botni ochish →
              </a>

              <span
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Botda tasdiqlang, keyin
                "Saytga qaytish" havolasini
                bosing.
              </span>

              {botExpiresAt && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#9CA3AF",
                  }}
                >
                  Muddati:{" "}
                  {new Date(
                    botExpiresAt,
                  ).toLocaleString("uz-UZ")}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// DIVIDER
// ─────────────────────────────────────────────

export function AuthDivider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "4px 0",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background: "#E5E7EB",
        }}
      />

      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "#9CA3AF",
        }}
      >
        yoki
      </span>

      <div
        style={{
          flex: 1,
          height: 1,
          background: "#E5E7EB",
        }}
      />
    </div>
  )
}