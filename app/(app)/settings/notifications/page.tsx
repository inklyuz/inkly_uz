"use client"

import { useState } from "react"

interface NotifSetting {
  key: string
  label: string
  description: string
  defaultValue: boolean
}

const settings: NotifSetting[] = [
  { key: "new_comment",   label: "Yangi izohlar",          description: "Maqolalaringizga izoh yozilganda",    defaultValue: true  },
  { key: "new_like",      label: "Yangi like",             description: "Maqolalaringizga like bosilganda",    defaultValue: false },
  { key: "new_follower",  label: "Yangi obunachi",         description: "Kimdir sizga obuna bo'lganda",        defaultValue: true  },
  { key: "featured",      label: "Tanlangan maqola",       description: "Maqolangiz «Tanlangan»ga tushganda",  defaultValue: true  },
  { key: "weekly_digest", label: "Haftalik xulosa",        description: "Platforma yangiliklari xulosa emaili", defaultValue: false },
  { key: "product_news",  label: "Mahsulot yangiliklari",  description: "Inkly yangi imkoniyatlari haqida",    defaultValue: true  },
]

export default function NotificationsSettingsPage() {
  const [values, setValues] = useState<Record<string, boolean>>(
    Object.fromEntries(settings.map((s) => [s.key, s.defaultValue])),
  )
  const [saved, setSaved] = useState(false)

  const toggle = (key: string) => {
    setValues((v) => ({ ...v, [key]: !v[key] }))
    setSaved(false)
  }

  const handleSave = () => {
    // API call would go here
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
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

            {/* Toggle */}
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
        {saved && <p className="text-sm text-green-600">Saqlandi ✓</p>}
        {!saved && <span />}
        <button
          onClick={handleSave}
          className="rounded-full bg-[#FF6A00] px-5 py-2 text-sm font-semibold text-white hover:bg-[#E85F00] transition-colors"
        >
          Saqlash
        </button>
      </div>
    </div>
  )
}
