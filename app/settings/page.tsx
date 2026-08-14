"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/lib/auth/context"
import { usersApi } from "@/lib/api/users"
import { creatorsApi } from "@/lib/api/creators"
import { Input, Textarea } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { CreatorMeResponse } from "@/types/api"

const profileSchema = z.object({
  full_name: z.string().min(2, "Ism kiritilishi shart"),
  username: z.string().min(3, "Username kamida 3 ta belgi bo'lishi kerak"),
  bio: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  creator_description: z.string().optional(),
  // Socials
  telegram: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  github: z.string().optional(),
  twitter: z.string().optional(),
})

type ProfileData = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const router = useRouter()
  const { state, refreshMe } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [creatorInfo, setCreatorInfo] = useState<CreatorMeResponse | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
  })

  // Ma'lumotlarni yuklash
  useEffect(() => {
    if (!state.loading && !state.user) {
      router.replace("/login")
      return
    }

    if (state.user && state.token) {
      // Formani user malumotlari bilan to'ldirish
      reset({
        full_name: state.user.full_name,
        username: state.user.username,
        bio: state.user.bio || "",
        website: state.user.website || "",
        location: state.user.location || "",
        telegram: state.user.socials?.telegram || "",
        instagram: state.user.socials?.instagram || "",
        youtube: state.user.socials?.youtube || "",
        github: state.user.socials?.github || "",
        twitter: state.user.socials?.twitter || "",
      })

      // Creator info ni olish
      creatorsApi.me(state.token)
        .then(res => {
          setCreatorInfo(res)
          reset((prev) => ({ ...prev, creator_description: res.description || "" }))
        })
        .catch(() => {
          // Oddiy user, creator emas
        })
    }
  }, [state, reset, router])

  const onSubmit = async (data: ProfileData) => {
    if (!state.token) return
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      // 1. User ma'lumotlarini yangilash
      await usersApi.updateMe(state.token, {
        full_name: data.full_name,
        username: data.username,
        bio: data.bio,
        website: data.website,
        location: data.location,
        socials: {
          telegram: data.telegram || null,
          instagram: data.instagram || null,
          youtube: data.youtube || null,
          github: data.github || null,
          twitter: data.twitter || null,
        }
      })

      // 2. Creator ma'lumotlarini yangilash (agar creator bo'lsa)
      if (creatorInfo) {
        await creatorsApi.updateMe(state.token, {
          description: data.creator_description,
        })
      }

      await refreshMe()
      setSuccessMsg("Ma'lumotlaringiz muvaffaqiyatli saqlandi!")
    } catch (err: any) {
      setErrorMsg(err.message || "Saqlashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  if (state.loading) {
    return <div className="p-12 text-center text-[#6B7280]">Yuklanmoqda...</div>
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 border-b border-[#E8E3DD] pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#141414]">Sozlamalar</h1>
        <p className="mt-2 text-sm text-[#36565F]">Shaxsiy ma'lumotlaringiz va profilingizni boshqaring.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        
        {/* Asosiy ma'lumotlar */}
        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-[#141414]">Asosiy ma'lumotlar</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="To'liq ism"
              error={errors.full_name?.message}
              {...register("full_name")}
            />
            <Input
              label="Username"
              error={errors.username?.message}
              {...register("username")}
            />
          </div>
          <Input
            label="Manzil"
            placeholder="Toshkent, O'zbekiston"
            {...register("location")}
          />
          <Textarea
            label="Qisqacha bio"
            placeholder="O'zingiz haqingizda 1-2 gap..."
            {...register("bio")}
          />
          <Input
            label="Shaxsiy veb-sayt"
            placeholder="https://..."
            {...register("website")}
          />
        </section>

        {/* Ijtimoiy tarmoqlar */}
        <section className="flex flex-col gap-5 border-t border-[#E8E3DD] pt-8">
          <h2 className="text-lg font-semibold text-[#141414]">Ijtimoiy tarmoqlar</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Telegram" placeholder="https://t.me/username" {...register("telegram")} />
            <Input label="Instagram" placeholder="https://instagram.com/username" {...register("instagram")} />
            <Input label="Twitter / X" placeholder="https://twitter.com/username" {...register("twitter")} />
            <Input label="GitHub" placeholder="https://github.com/username" {...register("github")} />
            <Input label="YouTube" placeholder="https://youtube.com/@username" {...register("youtube")} />
          </div>
        </section>

        {/* Creator section */}
        {creatorInfo && (
          <section className="flex flex-col gap-5 border-t border-[#E8E3DD] pt-8">
            <h2 className="text-lg font-semibold text-[#141414]">Mualliflik ma'lumotlari</h2>
            <Textarea
              label="Mualliflik tavsifi (Description)"
              placeholder="Siz qanday mavzularda yozasiz?"
              {...register("creator_description")}
            />
            <p className="text-sm text-[#6B7280]">
              Joriy mualliflik holatingiz: <span className="font-medium text-[#FF6A00] uppercase">{creatorInfo.status}</span>
            </p>
          </section>
        )}

        {errorMsg && (
          <div className="rounded-lg bg-[#DC2626]/10 p-4 text-[#DC2626]">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="rounded-lg bg-green-500/10 p-4 text-green-700">{successMsg}</div>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="accent" loading={loading}>
            O'zgarishlarni saqlash
          </Button>
        </div>
      </form>
    </div>
  )
}
