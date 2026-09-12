import { apiRequest } from "./client"
import { createSafeItemWrapper, createSafePageWrapper } from "./safe-wrapper"
import type { Page } from "@/types/api"

export interface TelegramVerificationStartResponse {
  verification_id: string
  token: string
  expires_at: string
  deep_link: string | null  // ← QO'SHILDI
}

export interface TelegramAccountResponse {
  uuid: string
  telegram_user_id: string
  telegram_username: string | null
  first_name: string | null
  last_name: string | null
  photo_url: string | null
  is_verified: boolean
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface TelegramChannelResponse {
  uuid: string
  telegram_channel_id: string
  username: string | null
  title: string
  description?: string | null
  photo_url: string | null
  member_count?: number | null
  publication_count?: number
  status: string
  is_active: boolean
  is_verified: boolean
  auto_publish: boolean
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface TelegramPublicationResponse {
  uuid: string
  post_id: number | null
  post_uuid: string | null
  post_title: string
  status: string
  telegram_message_id: string | null
  error_code: string | null
  error_message: string | null
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface TelegramPublishResponse {
  uuid: string
  post_id: number
  channel_id: string
  status: string
  public_url: string
  telegram_message_id: string | null
  published_at: string | null
}

function pageQuery(params: { page?: number; page_size?: number }) {
  const q = new URLSearchParams()
  if (params.page !== undefined) q.set("page", String(params.page))
  if (params.page_size !== undefined) q.set("page_size", String(params.page_size))
  const query = q.toString()
  return query ? `?${query}` : ""
}

export const telegramApi = {
  getAccount: (token: string) => apiRequest<TelegramAccountResponse>("/telegram/account", { token }),
  unlinkAccount: (token: string) => apiRequest<void>("/telegram/account", { method: "DELETE", token }),

  startVerification: (token: string) =>
    apiRequest<TelegramVerificationStartResponse>("/telegram/verification", { method: "POST", token }),

  /**
   * @internal INTERNAL — faqat Inkly bot tomonidan chaqiriladi.
   * Docs: `x-bot-token` header talab qilinadi, oddiy Bearer token EMAS.
   * Frontend SPA'dan hech qachon chaqirilmasligi kerak.
   */
  botConfirmVerification: (botToken: string, data: Record<string, unknown>) =>
    apiRequest<unknown>("/telegram/verification/bot-confirm", {
      method: "POST",
      body: data,
      headers: { "x-bot-token": botToken },
    }),

  verificationStatus: (token: string, verificationId?: string) =>
    apiRequest<{ status: "pending" | "confirmed" | "verified" | "expired" | "failed" }>(
      `/telegram/verification/status${verificationId ? `?verification_id=${encodeURIComponent(verificationId)}` : ""}`,
      { token },
    ),

  completeVerification: (token: string, data: { verification_id: string; token: string }) =>
    apiRequest<TelegramAccountResponse>("/telegram/verification/complete", { method: "POST", body: data, token }),

  listChannels: (token: string, params: { page?: number; page_size?: number } = {}) =>
    apiRequest<Page<TelegramChannelResponse>>(`/telegram/channels${pageQuery(params)}`, { token }),

  addChannel: (token: string, channelUsername: string) =>
    apiRequest<TelegramChannelResponse>("/telegram/channels", {
      method: "POST",
      body: { channel_username: channelUsername },
      token,
    }),

  getChannel: (token: string, channelUuid: string) =>
    apiRequest<TelegramChannelResponse>(`/telegram/channels/${encodeURIComponent(channelUuid)}`, { token }),

  /** PATCH /telegram/channels/:uuid/settings — auto/manual nashr rejimini almashtirish */
  updateChannelSettings: (token: string, channelUuid: string, autoPublish: boolean) =>
    apiRequest<TelegramChannelResponse>(
      `/telegram/channels/${encodeURIComponent(channelUuid)}/settings`,
      { method: "PATCH", body: { auto_publish: autoPublish }, token },
    ),

  removeChannel: (token: string, channelUuid: string) =>
    apiRequest<void>(`/telegram/channels/${encodeURIComponent(channelUuid)}`, { method: "DELETE", token }),

  reverifyChannel: (token: string, channelUuid: string) =>
    apiRequest<unknown>(`/telegram/channels/${encodeURIComponent(channelUuid)}/reverify`, { method: "POST", token }),

  /** POST /telegram/channels/{uuid}/posts/{post_uuid}/publish
   * Backend path parametri post_uuid (UUID string) — id (number) EMAS. */
  publishToChannel: (token: string, channelUuid: string, postUuid: string) =>
    apiRequest<TelegramPublishResponse>(`/telegram/channels/${encodeURIComponent(channelUuid)}/posts/${encodeURIComponent(postUuid)}/publish`, {
      method: "POST",
      token,
    }),

  syncPublication: (token: string, channelUuid: string, postUuid: string) =>
    apiRequest<TelegramPublishResponse>(`/telegram/channels/${encodeURIComponent(channelUuid)}/posts/${encodeURIComponent(postUuid)}/sync`, {
      method: "POST",
      token,
    }),

  publications: (token: string, channelUuid: string, params: { page?: number; page_size?: number } = {}) =>
    apiRequest<Page<TelegramPublicationResponse>>(
      `/telegram/channels/${encodeURIComponent(channelUuid)}/publications${pageQuery(params)}`,
      { token },
    ),

  /**
   * POST /telegram/channels/{uuid}/sync
   * Kanal metadata'sini (title, photo, members) Telegram API'dan yangilaydi.
   */
  syncChannel: (token: string, channelUuid: string) =>
    apiRequest<TelegramChannelResponse>(
      `/telegram/channels/${encodeURIComponent(channelUuid)}/sync`,
      { method: "POST", token },
    ),

  /**
   * POST /telegram/channels/publish-all/{post_uuid}
   * Postni barcha active+verified kanallarga bir yo'la publish qiladi.
   */
  /** POST /telegram/channels/{post_uuid}/publish-all
   * postUuid (UUID string) — backend path parametri. */
  publishToAllChannels: (token: string, postUuid: string) =>
    apiRequest<unknown>(
      `/telegram/channels/publish-all/${encodeURIComponent(postUuid)}`,
      { method: "POST", token },
    ),

  /** GET /telegram/bot/link — botga ulanish havolasi */
  getBotLink: (token: string) =>
    apiRequest<{ link: string } | unknown>("/telegram/bot/link", { token }),

  receiveWebhook: (body: unknown) => apiRequest<unknown>("/telegram/bot/webhook", { method: "POST", body }),
  removeWebhook: (token: string) => apiRequest<unknown>("/telegram/bot/webhook", { method: "DELETE", token }),
  setupWebhook: (token: string) => apiRequest<unknown>("/telegram/bot/webhook/setup", { method: "POST", token }),
  webhookStatus: (token: string) => apiRequest<unknown>("/telegram/bot/webhook/status", { token }),
}

export const getTelegramAccountSafe = createSafeItemWrapper(
  (token: string) => telegramApi.getAccount(token),
  { errorPrefix: "TELEGRAM_ACCOUNT" },
)

export const listTelegramChannelsSafe = createSafePageWrapper(
  (token: string, params: { page?: number; page_size?: number } = {}) => telegramApi.listChannels(token, params),
  20,
  { errorPrefix: "TELEGRAM_CHANNELS" },
)

export const getBotLinkSafe = createSafeItemWrapper(
  (token: string) => telegramApi.getBotLink(token),
  { errorPrefix: "TELEGRAM_BOT_LINK" },
)
