"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Save, Link2, Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth/context"
import { usersApi } from "@/lib/api/users"
import { uploadsApi } from "@/lib/api/uploads"
import { getMediaUrl } from "@/lib/api/client"
import { LoadingDots } from "@/components/ui/loading-dots"
import { DashboardContainer } from "@/components/layout/containers"

// Ijtimoiy tarmoqlar ro'yxati
const SOCIAL_LIST = [
  { key: "telegram",  label: "Telegram",   icon: "/icons/telegram.svg",  placeholder: "@username" },
  { key: "instagram", label: "Instagram",  icon: "/icons/instagram.svg", placeholder: "@username" },
  { key: "github",    label: "GitHub",     icon: "/icons/github.svg",    placeholder: "username"  },
  { key: "twitter",   label: "X (Twitter)",icon: "/icons/x.svg",         placeholder: "@username" },
  { key: "youtube",    label: "YouTube",    icon: "/icons/youtube.svg",   placeholder: "@kanal"    },
] as const

type SocialKey = (typeof SOCIAL_LIST)[number]["key"]

type FormState = {
  full_name: string
  username: string
  bio: string
  website: string
  location: string
  language: string
  socials: Record<SocialKey, string>
}

// Qo'shilgan ijtimoiy tarmoqlarni ko'rsatish uchun
function SocialTag({
  icon,
  label,
  value,
  onRemove,
}: {
  icon: string
  label: string
  value: string
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border-default bg-white px-3 py-2.5 text-sm">
      <Image src={icon} alt={label} width={16} height={16} className="h-4 w-4 flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
      <span className="text-text-muted">{label}</span>
      <span className="flex-1 truncate text-text-primary">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 flex-shrink-0 rounded text-text-muted transition-colors hover:text-text-primary"
        aria-label={`${label} ni o'chirish`}
      >
        <X size={13} />
      </button>
    </div>
  )
}

export default function ProfileSettingsPage() {
  const { state, refresh } = useAuth()
  const { user, token, loading } = state
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    full_name: "",
    username: "",
    bio: "",
    website: "",
    location: "",
    language: "uz",
    socials: {
      telegram: "",
      instagram: "",
      github: "",
      twitter: "",
      youtube: "",
    },
  })

  // Yangi ijtimoiy tarmoq qo'shish UI
  const [addingKey, setAddingKey] = useState<SocialKey | null>(null)
  const [addingValue, setAddingValue] = useState("")

  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name ?? "",
        username: user.username ?? "",
        bio: user.bio ?? "",
        website: user.website ?? "",
        location: user.location ?? "",
        language: "uz",
        socials: {
          telegram: user.socials?.telegram ?? "",
          instagram: user.socials?.instagram ?? "",
          github: user.socials?.github ?? "",
          twitter: user.socials?.twitter ?? "",
          youtube: user.socials?.youtube ?? "",
        },
      })
    }
  }, [user, loading, router])

  const handleField =
    (field: keyof Omit<FormState, "socials">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }))
      setError(null)
      setSuccess(false)
    }

  const removeSocial = (key: SocialKey) => {
    setForm((p) => ({ ...p, socials: { ...p.socials, [key]: "" } }))
  }

  const confirmAddSocial = () => {
    if (!addingKey || !addingValue.trim()) return
    setForm((p) => ({
      ...p,
      socials: { ...p.socials, [addingKey]: addingValue.trim() },
    }))
    setAddingKey(null)
    setAddingValue("")
  }

  const handleSubmit = async () => {
    if (!token) return
    setSaving(true)
    setError(null)
    try {
      await usersApi.updateMe(token, {
        full_name: form.full_name,
        username: form.username,
        bio: form.bio,
        website: form.website,
        location: form.location,
        telegram_username: form.socials.telegram || null,
        instagram_username: form.socials.instagram || null,
        github_username: form.socials.github || null,
        twitter_username: form.socials.twitter || null,
        youtube_username: form.socials.youtube || null,
      })
      await refresh()
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !token) return
    setUploadingAvatar(true)
    setError(null)
    try {
      const upload = await uploadsApi.avatar(token, file)
      await usersApi.updateMe(token, { avatar: upload.path })
      await refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Rasm yuklashda xatolik")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !token) return
    setUploadingCover(true)
    setError(null)
    try {
      const upload = await uploadsApi.cover(token, file)
      await usersApi.updateMe(token, { cover: upload.path })
      await refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Muqova yuklashda xatolik")
    } finally {
      setUploadingCover(false)
    }
  }

  // Qo'shilgan ijtimoiy tarmoqlar
  const activeSocials = SOCIAL_LIST.filter((s) => form.socials[s.key])

  // Qo'shish mumkin bo'lganlar (hali qo'shilmaganlar)
  const availableSocials = SOCIAL_LIST.filter((s) => !form.socials[s.key])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingDots size="lg" className="text-primary" />
      </div>
    )
  }

  return (
    // Saqlash paneli endi forma oxirida oddiy blok sifatida — fixed/sticky
    // emas, shu sabab sidebar yoki topbar bilan hech qachon ustma-ust tushmaydi.
    <DashboardContainer className="min-h-full py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col gap-6 pb-4">

      {/* Sarlavha */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Profil sozlamalari</h1>
        <p className="mt-1 text-sm text-text-muted">
          Profilingizni boshqaring va ma'lumotlaringizni yangilang.
        </p>
      </div>

      {/* Rasmlar qatori */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Avatar */}
        <div className="rounded-xl border border-border-default bg-white p-5">
          <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium text-text-primary">Profil rasmi</p>
              <p className="mt-0.5 text-sm text-text-muted">
                JPG, PNG yoki WebP. Maksimal 5 MB.
              </p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="mt-4 inline-flex items-center rounded-xl border border-border-default px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-muted disabled:opacity-50"
              >
                {uploadingAvatar ? <LoadingDots size="sm" className="mr-2" /> : null}
                {uploadingAvatar ? "Yuklanmoqda..." : "Rasmni almashtirish"}
              </button>
            </div>
            <Avatar src={user?.avatar} name={user?.full_name} size={72} className="flex-shrink-0 rounded-full" />
          </div>
        </div>

        {/* Cover */}
        <div className="rounded-xl border border-border-default bg-white p-5">
          <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-shrink-0">
              <p className="font-medium text-text-primary">Muqova rasmi</p>
              <p className="mt-0.5 text-sm text-text-muted">
                JPG, PNG yoki WebP. Maksimal 10 MB.
              </p>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
              <button
                type="button"
                disabled={uploadingCover}
                onClick={() => coverInputRef.current?.click()}
                className="mt-4 inline-flex items-center rounded-xl border border-border-default px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-muted disabled:opacity-50"
              >
                {uploadingCover ? <LoadingDots size="sm" className="mr-2" /> : null}
                {uploadingCover ? "Yuklanmoqda..." : user?.cover ? "Muqovani almashtirish" : "Muqova qo'shish"}
              </button>
            </div>
            {/* Cover preview */}
            <div
              className="h-20 w-full flex-shrink-0 overflow-hidden rounded-xl bg-bg-muted sm:w-36"
              style={
                user?.cover
                  ? { backgroundImage: `url(${getMediaUrl(user.cover)})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
            />
          </div>
        </div>
      </div>

      {/* Asosiy ma'lumotlar */}
      <div className="rounded-xl border border-border-default bg-white p-5">
        <h2 className="mb-5 flex items-center gap-2 font-semibold text-text-primary">
          <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Asosiy ma'lumotlar
        </h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Field label="To'liq ism">
            <Input value={form.full_name} onChange={handleField("full_name")} placeholder="Sardor Rahimov" maxLength={64} />
          </Field>

          <Field label="Website">
            <Input value={form.website} onChange={handleField("website")} placeholder="https://inkly.uz" type="url" />
          </Field>

          <Field label="Foydalanuvchi nomi">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-text-muted">@</span>
              <Input
                value={form.username}
                onChange={handleField("username")}
                className="pl-7"
                placeholder="username"
                maxLength={32}
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
          </Field>

          <Field label="Joylashuv">
            <Input value={form.location} onChange={handleField("location")} placeholder="Toshkent, O'zbekiston" />
          </Field>

          <div className="sm:col-span-1">
            <Field label="Bio">
              <textarea
                value={form.bio}
                onChange={handleField("bio")}
                rows={3}
                maxLength={160}
                placeholder="O'zingiz haqingizda qisqacha yozing..."
                className="w-full resize-none rounded-xl border border-border-default bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
              <p className="mt-1 text-right text-xs text-text-muted">{form.bio.length}/160</p>
            </Field>
          </div>

          <Field label="Til">
            <select
              value={form.language}
              onChange={handleField("language")}
              className="h-10 w-full rounded-xl border border-border-default bg-transparent px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            >
              <option value="uz">O'zbekcha</option>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Ijtimoiy tarmoqlar */}
      <div className="rounded-xl border border-border-default bg-white p-5">
        <h2 className="mb-5 flex items-center gap-2 font-semibold text-text-primary">
          <Link2 size={16} className="text-text-muted" />
          Ijtimoiy tarmoqlar
        </h2>

        {activeSocials.length > 0 && (
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {activeSocials.map((s) => (
              <SocialTag key={s.key} icon={s.icon} label={s.label} value={form.socials[s.key]} onRemove={() => removeSocial(s.key)} />
            ))}
          </div>
        )}

        {addingKey ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={addingKey}
              onChange={(e) => setAddingKey(e.target.value as SocialKey)}
              className="h-10 rounded-xl border border-border-default bg-transparent px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {availableSocials.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <Input
              value={addingValue}
              onChange={(e) => setAddingValue(e.target.value)}
              placeholder={SOCIAL_LIST.find((s) => s.key === addingKey)?.placeholder ?? "@username"}
              className="flex-1"
              autoFocus
              autoCapitalize="none"
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAddSocial()
                if (e.key === "Escape") { setAddingKey(null); setAddingValue("") }
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmAddSocial}
                className="rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-inkly-hover"
              >
                Qo'shish
              </button>
              <button
                type="button"
                onClick={() => { setAddingKey(null); setAddingValue("") }}
                className="rounded-xl p-2 text-text-muted hover:bg-bg-muted"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          availableSocials.length > 0 && (
            <button
              type="button"
              onClick={() => setAddingKey(availableSocials[0].key)}
              className="flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
            >
              <Plus size={15} />
              Yangi link qo'shish
            </button>
          )
        )}
      </div>

      {/* Saqlash paneli — endi oddiy, sahifa oqimi ichidagi blok.
          Avval "fixed"/"sticky" + manfiy margin bilan sidebar va topbar'ning
          haqiqiy o'lchamiga bog'liq edi va shu sabab ularga yopishib qolardi.
          Endi u hech qanday tashqi konteyner o'lchamiga bog'liq emas —
          shunchaki formaning oxirida turadi, boshqa hech nimaga yopishmaydi. */}
      <div className="flex flex-col items-stretch gap-3 rounded-xl border border-border-default bg-white p-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">O'zgarishlar saqlandi ✓</p>}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,var(--color-inkly-orange),var(--color-inkly-coral))" }}
        >
          {saving ? <LoadingDots size="sm" /> : <Save size={14} />}
          O'zgarishlarni saqlash
        </button>
      </div>

      </div>
    </DashboardContainer>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      {children}
    </div>
  )
}