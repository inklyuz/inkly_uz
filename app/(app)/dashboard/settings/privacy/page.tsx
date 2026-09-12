"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { LoadingDots } from "@/components/ui/loading-dots"

interface PrivacySetting {
  key: string
  label: string
  description: string
  options: { value: string; label: string }[]
  defaultValue: string
}

const privacySettings: PrivacySetting[] = [
  {
    key: "profile_visibility",
    label: "Profil ko'rinishi",
    description: "Profilingizni kimlar ko'ra oladi",
    options: [
      { value: "public",  label: "Hamma" },
      { value: "private", label: "Hech kim" },
    ],
    defaultValue: "public",
  },
  {
    key: "show_email",
    label: "Emailni ko'rsatish",
    description: "Profilingizda email manzilini ko'rsatish",
    options: [
      { value: "yes", label: "Ko'rsat" },
      { value: "no",  label: "Ko'rsatma" },
    ],
    defaultValue: "no",
  },
]

const STORAGE_KEY = "inkly_privacy_prefs"

// Sinxron localStorage o'qish (API so'rovi yo'q) — lazy initializer orqali,
// shunda keraksiz "loading" holati va bir martalik spinner flash bo'lmaydi.
function readStoredPrivacyPrefs(): Record<string, string> {
  const defaults = Object.fromEntries(privacySettings.map((s) => [s.key, s.defaultValue]))
  if (typeof window === "undefined") return defaults
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaults
  try {
    return { ...defaults, ...JSON.parse(stored) }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return defaults
  }
}

export default function PrivacySettingsPage() {
  const [values, setValues] = useState<Record<string, string>>(readStoredPrivacyPrefs)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Backendda profil ko'rinishi/email ko'rsatish uchun hech qanday field yoki endpoint
          yo'q (User modelida bunday ustunlar mavjud emas). Shu sababli bu sozlamalar hozircha
          faqat shu brauzerda saqlanadi va real profilga ta'sir qilmaydi — buni yashirmasdan
          ochiq ko'rsatamiz. */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Bu bo'lim hali backendga ulanmagan — o'zgarishlar hozircha profilingizga real ta'sir
        qilmaydi, faqat shu qurilmada saqlanadi. Tez orada qo'shiladi.
      </div>

      <div className="rounded-xl border border-border-default bg-white">
        {privacySettings.map((s, i) => (
          <div
            key={s.key}
            className={`px-6 py-5 ${i < privacySettings.length - 1 ? "border-b border-border-default" : ""}`}
          >
            <p className="text-sm font-medium text-text-primary">{s.label}</p>
            <p className="mb-3 text-xs text-text-muted">{s.description}</p>

            <div className="flex flex-wrap gap-2">
              {s.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setValues((v) => ({ ...v, [s.key]: opt.value }))
                    setSaved(false)
                  }}
                  className={`rounded-xl border px-4 py-1.5 text-sm font-medium transition-colors ${
                    values[s.key] === opt.value
                      ? "border-primary bg-inkly-orange-light text-primary"
                      : "border-border-default text-text-secondary hover:border-primary hover:text-primary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        {saving ? (
          <span className="flex items-center gap-1.5 text-sm text-text-muted">
            <LoadingDots size="sm" />
            Saqlanmoqda...
          </span>
        ) : saved ? (
          <p className="flex items-center gap-1.5 text-sm text-green-600">
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