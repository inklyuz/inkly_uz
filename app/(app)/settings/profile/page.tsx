"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save, User, Globe, MapPin } from "lucide-react"
import { Twitter, Github } from "@/components/ui/brand-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth/context"
import { usersApi } from "@/lib/api/users"
import { uploadsApi } from "@/lib/api/uploads"

export default function ProfileSettingsPage() {
  const { state, refresh } = useAuth()
  const { user, token, loading } = state
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    bio: "",
    website: "",
    location: "",
    twitter: "",
    github: "",
  })
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
      return
    }
    if (user) {
      setForm({
        full_name: user.full_name ?? "",
        username: user.username ?? "",
        bio: user.bio ?? "",
        website: user.website ?? "",
        location: user.location ?? "",
        twitter: user.socials?.twitter ?? "",
        github: user.socials?.github ?? "",
      })
    }
  }, [user, loading, router])

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setError(null)
      setSuccess(false)
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
        twitter_username: form.twitter || null,
        github_username: form.github || null,
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
      // Qadam 1: Fayl yuklash → path (relative) va url (to'liq) olish
      const upload = await uploadsApi.avatar(token, file)

      // Qadam 2: Relative path ni profil yangilashga yuborish
      // MUHIM: url emas, path! Backend path qabul qiladi
      await usersApi.updateMe(token, { avatar: upload.path })
      await refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Rasm yuklashda xatolik")
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#FF6A00]" />
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-[#141414]">Profil sozlamalari</h1>

      <div className="space-y-8">
        {/* Avatar */}
        <section className="flex items-center gap-5 rounded-2xl border border-[#E8E3DD] bg-white p-6">
          <Avatar src={user?.avatar} name={user?.full_name} size={72} />
          <div>
            <p className="font-medium text-[#141414]">Profil rasmi</p>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="ghost"
              className="mt-2 gap-2 rounded-full px-4 text-sm"
              disabled={uploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
            >
              {uploadingAvatar && <Loader2 size={14} className="animate-spin" />}
              {uploadingAvatar ? "Yuklanmoqda..." : "Rasmni almashtirish"}
            </Button>
          </div>
        </section>

        {/* Asosiy ma'lumotlar */}
        <section className="space-y-4 rounded-2xl border border-[#E8E3DD] bg-white p-6">
          <h2 className="flex items-center gap-2 font-semibold text-[#141414]">
            <User size={16} /> Asosiy ma'lumotlar
          </h2>

          <Field label="To'liq ism">
            <Input
              value={form.full_name}
              onChange={handleChange("full_name")}
              placeholder="Sardor Rahimov"
            />
          </Field>

          <Field label="Foydalanuvchi nomi">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">@</span>
              <Input
                value={form.username}
                onChange={handleChange("username")}
                className="pl-7"
                placeholder="sardor"
              />
            </div>
          </Field>

          <Field label="Bio">
            <textarea
              value={form.bio}
              onChange={handleChange("bio")}
              rows={3}
              placeholder="O'zingiz haqingizda qisqacha..."
              className="w-full resize-none rounded-xl border border-[#E8E3DD] bg-[#FFF9F3] px-4 py-3 text-sm text-[#141414] placeholder:text-[#6B7280] focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/20 transition"
            />
          </Field>

          <Field label="Joylashuv">
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <Input
                value={form.location}
                onChange={handleChange("location")}
                className="pl-8"
                placeholder="Toshkent, O'zbekiston"
              />
            </div>
          </Field>

          <Field label="Veb-sayt">
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <Input
                value={form.website}
                onChange={handleChange("website")}
                className="pl-8"
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </Field>
        </section>

        {/* Ijtimoiy tarmoqlar */}
        <section className="space-y-4 rounded-2xl border border-[#E8E3DD] bg-white p-6">
          <h2 className="font-semibold text-[#141414]">Ijtimoiy tarmoqlar</h2>

          <Field label="Twitter / X">
            <div className="relative">
              <Twitter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <Input
                value={form.twitter}
                onChange={handleChange("twitter")}
                className="pl-8"
                placeholder="username"
              />
            </div>
          </Field>

          <Field label="GitHub">
            <div className="relative">
              <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <Input
                value={form.github}
                onChange={handleChange("github")}
                className="pl-8"
                placeholder="username"
              />
            </div>
          </Field>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">Saqlandi ✓</p>}
          {!error && !success && <span />}

          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="gap-2 rounded-full bg-[#FF6A00] px-6 font-semibold text-white hover:bg-[#E85F00] disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Saqlash
          </Button>
        </div>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#141414]">{label}</label>
      {children}
    </div>
  )
}
