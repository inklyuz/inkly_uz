"use client"

import { useEffect, useState } from "react"
import { Loader2, Check, Bell, BellOff, Smartphone } from "lucide-react"
import { useAuth } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import {
  notificationsApi,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/lib/api/notifications"
import {
  isPushSupported,
  getPermissionState,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/notifications/push"
import { toast } from "sonner"

interface NotifSetting {
  key: keyof NotificationPreferences
  label: string
  description: string
}

const settings: NotifSetting[] = [
  { key: "new_comment",   label: "Yangi izohlar",          description: "Maqolalaringizga izoh yozilganda", },
  { key: "new_like",      label: "Yangi like",             description: "Maqolalaringizga like bosilganda", },
  { key: "new_follower",  label: "Yangi obunachi",         description: "Kimdir sizga obuna bo'lganda", },
  { key: "featured",      label: "Tanlangan maqola",       description: "Maqolangiz «Tanlangan»ga tushganda", },
  { key: "weekly_digest", label: "Haftalik xulosa",        description: "Platforma yangiliklari xulosa emaili", },
  { key: "product_news",  label: "Mahsulot yangiliklari",  description: "Inkly yangi imkoniyatlari haqida", },
]

export default function NotificationsSettingsPage() {
  const { state } = useAuth()
  const { token } = state

  const [values, setValues] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Browser notification state
  const [pushSupported, setPushSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default")
  const [pushLoading, setPushLoading] = useState(false)

  useEffect(() => {
    setPushSupported(isPushSupported())
    setPermission(getPermissionState())

    if (!token) {
      setLoading(false)
      return
    }

    notificationsApi.getPreferences(token)
      .then((prefs) => setValues({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...prefs }))
      .catch(() => {
        // Backend tayyor bo'lmagan bo'lsa localStorage dan o'qiymiz
        const stored = localStorage.getItem("inkly_notif_prefs")
        if (stored) {
          try {
            setValues({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(stored) })
          } catch {
            // ignore
          }
        }
      })
      .finally(() => setLoading(false))
  }, [token])

  const toggle = (key: keyof NotificationPreferences) => {
    setValues((v) => ({ ...v, [key]: !v[key] }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!token) {
      // Backend yo'q — localStorage ga saqlash
      localStorage.setItem("inkly_notif_prefs", JSON.stringify(values))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      return
    }

    setSaving(true)
    try {
      // Backend tayyor bo'lsa yuboramiz; xato bo'lsa localStorage ga fallback
      await notificationsApi.updatePreferences(token, values)
      localStorage.setItem("inkly_notif_prefs", JSON.stringify(values))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      localStorage.setItem("inkly_notif_prefs", JSON.stringify(values))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleBrowserNotifications = async () => {
    if (!pushSupported) {
      toast.error("Brauzeringiz bildirishnomalarni qo'llab-quvvatlamaydi")
      return
    }

    if (permission === "granted") {
      // Already enabled — unsubscribe
      setPushLoading(true)
      try {
        await unsubscribeFromPush()
        setPermission("default")
        setValues((v) => ({ ...v, browser_enabled: false }))
        if (token) await notificationsApi.unsubscribePush(token).catch(() => {})
        toast.success("Bildirishnomalar o'chirildi")
      } catch {
        toast.error("Xatolik yuz berdi")
      } finally {
        setPushLoading(false)
      }
      return
    }

    // Request permission + subscribe
    setPushLoading(true)
    try {
      const permissionResult = await requestNotificationPermission()
      setPermission(permissionResult)

      if (permissionResult === "granted") {
        const subscription = await subscribeToPush()
        if (subscription) {
          setValues((v) => ({ ...v, browser_enabled: true }))
          if (token) {
            await notificationsApi.subscribePush(token, subscription as any).catch(() => {})
          }
          toast.success("Bildirishnomalar yoqildi")
        } else {
          toast.error("Obuna yaratib bo'lmadi (VAPID kalit sozlanmagan bo'lishi mumkin)")
        }
      } else {
        toast.error("Ruxsat berilmadi")
      }
    } catch {
      toast.error("Xatolik yuz berdi")
    } finally {
      setPushLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#FF6A00]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Browser Notifications */}
      <div className="rounded-2xl border border-[#E8E3DD] bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-9 w-9 shrink-0 rounded-lg bg-[#FFF3E8] flex items-center justify-center">
              {permission === "granted" ? (
                <Bell size={18} className="text-[#FF6A00]" />
              ) : (
                <BellOff size={18} className="text-[#6B7280]" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#141414]">Brauzer bildirishnomalari</p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {permission === "unsupported"
                  ? "Brauzeringiz bildirishnomalarni qo'llab-quvvatlamaydi"
                  : permission === "granted"
                    ? "Bildirishnomalar yoqilgan"
                    : permission === "denied"
                      ? "Bildirishnomalar bloklangan — brauzer sozlamalaridan ruxsat bering"
                      : "Maqolalar haqida darhol xabardor bo'lish uchun yoqing"
                }
              </p>
            </div>
          </div>

          {pushSupported && permission !== "denied" && (
            <Button
              onClick={handleToggleBrowserNotifications}
              disabled={pushLoading}
              variant={permission === "granted" ? "ghost" : "primary"}
              className={
                permission === "granted"
                  ? "rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0"
                  : "rounded-full bg-[#FF6A00] px-4 py-2 font-semibold text-white hover:bg-[#E85F00] shrink-0"
              }
            >
              {pushLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : permission === "granted" ? (
                "O'chirish"
              ) : (
                <>
                  <Smartphone size={14} className="mr-1.5" />
                  Yoqish
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Email/In-app Notifications */}
      <div className="rounded-2xl border border-[#E8E3DD] bg-white">
        {settings.map((s, i) => (
          <div
            key={s.key}
            className={`flex items-center justify-between gap-4 px-6 py-4 ${
              i < settings.length - 1 ? "border-b border-[#E8E3DD]" : ""
            }`}
          >
            <div>
              <p className="text-sm font-medium text-[#141414]">{s.label}</p>
              <p className="text-xs text-[#6B7280]">{s.description}</p>
            </div>

            <button
              role="switch"
              aria-checked={values[s.key]}
              onClick={() => toggle(s.key)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                values[s.key] ? "bg-[#FF6A00]" : "bg-[#E8E3DD]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  values[s.key] ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        {saving ? (
          <span className="text-sm text-[#6B7280] flex items-center gap-1.5">
            <Loader2 size={14} className="animate-spin" />
            Saqlanmoqda...
          </span>
        ) : saved ? (
          <p className="text-sm text-green-600 flex items-center gap-1.5">
            <Check size={14} />
            Saqlandi
          </p>
        ) : (
          <span />
        )}
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="rounded-full bg-[#FF6A00] px-5 py-2 text-sm font-semibold text-white hover:bg-[#E85F00] transition-colors disabled:opacity-50"
        >
          Saqlash
        </button>
      </div>
    </div>
  )
}