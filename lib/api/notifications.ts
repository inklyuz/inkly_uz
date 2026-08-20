import { apiRequest } from "./client"

export interface NotificationPreferences {
  new_comment: boolean
  new_like: boolean
  new_follower: boolean
  featured: boolean
  weekly_digest: boolean
  product_news: boolean
  browser_enabled: boolean
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  new_comment: true,
  new_like: false,
  new_follower: true,
  featured: true,
  weekly_digest: false,
  product_news: true,
  browser_enabled: false,
}

export const notificationsApi = {
  // Tasdiqlash: backend tayyor bo'lganda ishlaydi
  getPreferences: (token: string) =>
    apiRequest<NotificationPreferences>("/notifications/preferences", { token }),

  updatePreferences: (token: string, prefs: Partial<NotificationPreferences>) =>
    apiRequest<NotificationPreferences>("/notifications/preferences", {
      method: "PATCH",
      body: prefs,
      token,
    }),

  subscribePush: (token: string, subscription: PushSubscriptionData) =>
    apiRequest<void>("/notifications/subscribe", {
      method: "POST",
      body: subscription,
      token,
    }),

  unsubscribePush: (token: string) =>
    apiRequest<void>("/notifications/subscribe", {
      method: "DELETE",
      token,
    }),
}
