"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2, Send, CheckCircle2, AlertCircle, ExternalLink, MoreVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth/context"
import { telegramApi } from "@/lib/api/telegram"
import type { TelegramChannelResponse } from "@/lib/api/telegram"
import { postsApi } from "@/lib/api/posts"
import type { PostListItem } from "@/types/api"
import { toast } from "sonner"

export default function TelegramChannelsPage() {
  const { state } = useAuth()
  const { token, loading: authLoading } = state
  const router = useRouter()

  const [channels, setChannels] = useState<TelegramChannelResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newChannelUsername, setNewChannelUsername] = useState("")
  const [removing, setRemoving] = useState<string | null>(null)

  // Post tanlash dialogi
  const [publishChannel, setPublishChannel] = useState<TelegramChannelResponse | null>(null)
  const [publishPosts, setPublishPosts] = useState<PostListItem[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<PostListItem | null>(null)

  // Kanallarni yuklash
  useEffect(() => {
    if (!token) return
    setLoading(true)
    telegramApi.listChannels(token)
      .then((data) => setChannels(data.items))
      .catch((err) => {
        console.error("Failed to load channels:", err)
        toast.error("Kanallar yuklanmadi")
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleAddChannel = async () => {
    if (!token || !newChannelUsername.trim()) return
    const username = newChannelUsername.trim().replace("@", "")
    setAdding(true)
    try {
      const channel = await telegramApi.addChannel(token, username)
      setChannels((prev) => [...prev, channel])
      setNewChannelUsername("")
      toast.success(`"${channel.title}" kanali qo'shildi`)
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string }
      if (error.code === "CHANNEL_NOT_ADMIN") {
        toast.error("Siz bu kanalning admini emassiz. Avval botni kanalga admin qiling.")
      } else if (error.code === "CHANNEL_NOT_FOUND") {
        toast.error("Kanal topilmadi. Username ni tekshiring.")
      } else {
        toast.error(error.message ?? "Kanal qo'shishda xatolik")
      }
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveChannel = async (channelUuid: string, channelTitle: string) => {
    if (!token) return
    const ok = window.confirm(`"${channelTitle}" kanalini o'chirishni tasdiqlaysizmi?`)
    if (!ok) return

    setRemoving(channelUuid)
    try {
      await telegramApi.removeChannel(token, channelUuid)
      setChannels((prev) => prev.filter((c) => c.uuid !== channelUuid))
      toast.success("Kanal o'chirildi")
    } catch (err) {
      console.error("Remove channel failed:", err)
      toast.error("Kanalni o'chirishda xatolik")
    } finally {
      setRemoving(null)
    }
  }

  const handlePublishToChannel = async (channelUuid: string) => {
    if (!token) return
    // Post UUID ni so'rash - keyinroq posts API bilan integratsiya qilinadi
    const postUuid = window.postUuidToPublish // Agar global o'zgaruvchi bo'lsa
    if (!postUuid) {
      toast.error("Yuborilishi kerak maqola tanlanmadi")
      return
    }

    setPublishing(channelUuid)
    try {
      await telegramApi.publishToChannel(token, channelUuid, postUuid)
      toast.success("Maqola kanalda yuborildi")
    } catch (err) {
      console.error("Publish failed:", err)
      toast.error("Maqolani yuborishda xatolik")
    } finally {
      setPublishing(null)
    }
  }

  const handleOpenChannel = (username: string) => {
    window.open(`https://t.me/${username}`, "_blank")
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#FF6A00]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#141414]">Telegram kanallar</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Kanallarni qo'shing, boshqaring va maqolalarni ularning orqali yuboring.
        </p>
      </div>

      {/* Add Channel Form */}
      <div className="rounded-2xl border border-[#E8E3DD] bg-white p-6">
        <h3 className="font-semibold text-[#141414] mb-4">Yangi kanal qo'shish</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">@</span>
            <Input
              type="text"
              value={newChannelUsername}
              onChange={(e) => setNewChannelUsername(e.target.value)}
              placeholder="kanal_username (masalan: my_channel)"
              className="pl-8"
              onKeyDown={(e) => e.key === "Enter" && handleAddChannel()}
            />
          </div>
          <Button
            onClick={handleAddChannel}
            disabled={adding || !newChannelUsername.trim()}
            className="rounded-full bg-[#FF6A00] px-5 font-semibold text-white hover:bg-[#E85F00] disabled:opacity-50 whitespace-nowrap"
          >
            {adding ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                Qo'shilmoqda...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Qo'shish
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-[#6B7280] mt-2">
          Eslatma: Bot kanalga admin sifatida qo'shilgan bo'lishi kerak. Kanal username'ini @ belgisisiz kiriting.
        </p>
      </div>

      {/* Channels List */}
      <div className="rounded-2xl border border-[#E8E3DD] bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#FF6A00]" />
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#F2F4F7] flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#6B7280]">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <path d="M4 22h16" />
                <path d="M12 15v7" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#141414]">Kanallar yo'q</h3>
            <p className="text-sm text-[#6B7280] mt-1 max-w-sm mx-auto">
              Avval kanal qo'shing. Botni kanalga admin qiling va username ni yukoridagi maydonga kiriting.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E3DD]">
            {channels.map((channel) => (
              <div
                key={channel.uuid}
                className="flex items-center justify-between gap-4 p-5 hover:bg-[#F2F4F7] transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-[#FFF3E8] flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#FF6A00]">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#141414] truncate">{channel.title}</p>
                      {channel.is_verified && (
                        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" title="Tasdiqlangan" />
                      )}
                    </div>
                    <p className="text-sm text-[#6B7280] truncate">@{channel.channel_username}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">Qo'shilgan: {new Date(channel.created_at).toLocaleDateString("uz-UZ")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenChannel(channel.channel_username)}
                    className="text-[#6B7280] hover:text-[#141414] hover:bg-[#F2F4F7]"
                    title="Kanalni ochish"
                  >
                    <ExternalLink size={16} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePublishToChannel(channel.uuid)}
                    disabled={publishing === channel.uuid}
                    className="text-[#FF6A00] hover:bg-[#FFF3E8] hover:text-[#E85F00] disabled:opacity-50"
                    title="Maqolani yuborish"
                  >
                    {publishing === channel.uuid ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveChannel(channel.uuid, channel.title)}
                    disabled={removing === channel.uuid}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Kanalni o'chirish"
                  >
                    {removing === channel.uuid ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help */}
      <div className="rounded-2xl bg-[#FFF3E8] border border-[#FFE8D0] p-6">
        <h3 className="font-semibold text-[#141414] mb-3 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#FF6A00]">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          Qo'llanma
        </h3>
        <ol className="space-y-2 text-sm text-[#36565F] list-decimal list-inside">
          <li>Telegramda kanal yarating yoki mavjud kanalga kiring</li>
          <li>Botni (@inkly_uz_bot) kanalga admin qiling (Xabar yuborish huquqi bilan)</li>
          <li>Kanal username'ini (masalan: <code className="bg-[#FFE8D0] px-1 rounded font-mono text-xs">my_channel</code>) yukoridagi maydonga kiriting</li>
          <li>"Qo'shish" tugmasini bosing — kanal tasdiqlanadi</li>
          <li>Maqola yozganda "Telegramga yuborish" tugmasi orqali tanlangan kanalda yuboring</li>
        </ol>
      </div>
    </div>
  )
}