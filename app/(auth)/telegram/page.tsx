"use client"

import { useRouter } from "next/navigation"
import { AuthMethods } from "@/components/auth/auth-methods"
import { AuthShell } from "@/components/auth/auth-shell"

export default function TelegramPage() {
  const router = useRouter()

  return (
    <AuthShell
      title="Telegram orqali kirish"
      subtitle="Telegram akkauntingiz bilan bir marta bosishda kiring."
    >
      <AuthMethods onTelegramSuccess={() => router.replace("/dashboard")} />
    </AuthShell>
  )
}
