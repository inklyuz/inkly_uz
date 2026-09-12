"use client"

import { useEffect, useState } from "react"
import { Check, Bell, BellOff, Smartphone } from "lucide-react"
import {
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
import { LoadingDots } from "@/components/ui/loading-dots"

interface NotifSetting {
  key: keyof NotificationPreferences
  label: string
  description: string
}

const settings: NotifSetting[] = [
  { key: "new_comment",   label: "Yangi izohlar",          description: "Maqolalaringizga izoh yozilganda" },
  { key: "new_like",      label: "Yangi like",             description: "Maqolalaringizga like bosilganda" },
  { key: "new_follower",  label: "Yangi obunachi",         description: "Kimdir sizga obuna bo'lganda" },
  { key: "featured",      label: "Tanlangan maqola",       description: "Maqolangiz «Tanlangan»ga tushganda" },
  { key: "weekly_digest", label: "Haftalik xulosa",        description: "Platforma yangiliklari xulosa emaili" },
  { key: "product_news",  label: "Mahsulot yangiliklari",  description: "Inkly yangi imkoniyatlari haqida" },
]

// Bu funksiyalar hech qanday API/tarmoq so'rovi qilmaydi — faqat sinxron
// localStorage/brauzer o'qishlari. Shu sababli lazy useState initializer
// orqali chaqiramiz: bu holatda "loading" holatiga umuman ehtiyoj yo'q —
// oldingi versiyada useEffect+setLoading(false) ishlatilgani sabab har bir
// sahifa ochilishida (hech qanday API kutmasa ham) bir render davomida
// keraksiz spinner ko'rinardi.
function readStoredNotifPrefs(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFERENCES
  const stored = localStorage.getItem("inkly_notif_prefs")
  if (!stored) return DEFAULT_NOTIFICATION_PREFERENCES
  try {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(stored) }
  } catch {
    localStorage.removeItem("inkly_notif_prefs")
    return DEFAULT_NOTIFICATION_PREFERENCES
  }
}

export default function NotificationsSettingsPage() {

  const [values, setValues] = useState<NotificationPreferences>(readStoredNotifPrefs)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Browser notification state — bular ham sinxron API'lar (Notification.permission
  // va h.k.), shuning uchun to'g'ridan-to'g'ri lazy initializer bilan o'qiladi.
  const [pushSupported, setPushSupported] = useState(() => (typeof window === "undefined" ? false : isPushSupported()))
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    () => (typeof window === "undefined" ? "default" : getPermissionState()),
  )
  const [pushLoading, setPushLoading] = useState(false)

  useEffect(() => {
    // Boshqa tab/oynada saqlanganda bu tabni ham yangilash
    const onStorage = (e: StorageEvent) => {
      if (e.key === "inkly_notif_prefs" && e.newValue) {
        try {
          setValues({ ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(e.newValue) })
        } catch { /* ignore */ }
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const toggle = (key: keyof NotificationPreferences) => {
    setValues((v) => ({ ...v, [key]: !v[key] }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
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
      setPushLoading(true)
      try {
        await unsubscribeFromPush()
        setPermission("default")
        setValues((v) => ({ ...v, browser_enabled: false }))
        toast.success("Bildirishnomalar o'chirildi")
      } catch {
        toast.error("Xatolik yuz berdi")
      } finally {
        setPushLoading(false)
      }
      return
    }

    setPushLoading(true)
    try {
      const permissionResult = await requestNotificationPermission()
      setPermission(permissionResult)

      if (permissionResult === "granted") {
        const subscription = await subscribeToPush()
        if (subscription) {
          setValues((v) => ({ ...v, browser_enabled: true }))
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

  return (
    <div className="space-y-6">
      {/* Backend hozircha bildirishnoma sozlamalarini saqlash uchun endpoint taqdim etmaydi
          (faqat GET/POST /notifications va /read-all, /{id}/read mavjud). Shu sababli bu
          sozlamalar faqat shu brauzerda saqlanadi va serverda yuboriladigan bildirishnomalarga
          hozircha ta'sir qilmaydi — buni foydalanuvchiga ochiq aytamiz, yashirmaymiz. */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Bu sozlamalar hozircha faqat shu qurilma/brauzerda saqlanadi. Serverda yuboriladigan
        bildirishnomalarni boshqarish tez orada qo'shiladi.
      </div>

      {/* Browser Notifications */}
      <div className="rounded-xl border border-border-default bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-9 w-9 shrink-0 rounded-xl bg-inkly-orange-light flex items-center justify-center">
              {permission === "granted" ? (
                <Bell size={18} className="text-primary" />
              ) : (
                <BellOff size={18} className="text-text-muted" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Brauzer bildirishnomalari</p>
              <p className="text-xs text-text-muted mt-0.5">
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
            <button
              onClick={handleToggleBrowserNotifications}
              disabled={pushLoading}
              className={
                permission === "granted"
                  ? "shrink-0 rounded-xl px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  : "shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
              }
              style={
                permission === "granted"
                  ? undefined
                  : { background: "linear-gradient(135deg,var(--color-inkly-orange),var(--color-inkly-coral))" }
              }
            >
              {pushLoading ? (
                <LoadingDots size="sm" />
              ) : permission === "granted" ? (
                "O'chirish"
              ) : (
                <span className="flex items-center gap-1.5">
                  <Smartphone size={14} />
                  Yoqish
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Email/In-app Notifications */}
      <div className="rounded-xl border border-border-default bg-white">
        {settings.map((s, i) => (
          <div
            key={s.key}
            className={`flex items-center justify-between gap-4 px-6 py-4 ${
              i < settings.length - 1 ? "border-b border-border-default" : ""
            }`}
          >
            <div>
              <p className="text-sm font-medium text-text-primary">{s.label}</p>
              <p className="text-xs text-text-muted">{s.description}</p>
            </div>

            <button
              role="switch"
              aria-checked={values[s.key]}
              onClick={() => toggle(s.key)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                values[s.key] ? "bg-primary" : "bg-border-default"
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
          <span className="text-sm text-text-muted flex items-center gap-1.5">
            <LoadingDots size="sm" />
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
          className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,var(--color-inkly-orange),var(--color-inkly-coral))" }}
        >
          Saqlash
        </button>
      </div>
    </div>
  )
}