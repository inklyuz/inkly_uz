import { apiRequest } from "./client"

export interface TelegramVerificationStartResponse {
  verification_id: string
  token: string
  expires_at: string
}

export interface TelegramAccountResponse {
  telegram_user_id: number
  username: string | null
  first_name: string
  last_name: string | null
  linked_at: string
}

export interface TelegramChannelResponse {
  uuid: string
  channel_username: string
  title: string
  is_verified: boolean
  created_at: string
}

// Linking a Telegram account to an ALREADY-LOGGED-IN user's profile.
// Distinct from `authApi.telegramStart/telegramVerify`, which is the
// unauthenticated *login* flow used on /login/telegram.
export const telegramApi = {
  getAccount: (token: string) => apiRequest<TelegramAccountResponse | null>("/telegram/account", { token }),

  unlinkAccount: (token: string) => apiRequest<void>("/telegram/account", { method: "DELETE", token }),

  startVerification: (token: string) =>
    apiRequest<TelegramVerificationStartResponse>("/telegram/verification", { method: "POST", token }),

  verificationStatus: (token: string) =>
    apiRequest<{ status: string }>("/telegram/verification/status", { token }),

  completeVerification: (token: string, data: { verification_id: string; token: string }) =>
    apiRequest<TelegramAccountResponse>("/telegram/verification/complete", { method: "POST", body: data, token }),

  listChannels: (token: string) => apiRequest<TelegramChannelResponse[]>("/telegram/channels", { token }),

  addChannel: (token: string, channelUsername: string) =>
    apiRequest<TelegramChannelResponse>("/telegram/channels", {
      method: "POST",
      body: { channel_username: channelUsername },
      token,
    }),

  removeChannel: (token: string, channelUuid: string) =>
    apiRequest<void>(`/telegram/channels/${channelUuid}`, { method: "DELETE", token }),

  publishToChannel: (token: string, channelUuid: string, postUuid: string) =>
    apiRequest<void>(`/telegram/channels/${channelUuid}/posts/${postUuid}/publish`, { method: "POST", token }),
}
