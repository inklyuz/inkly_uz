"use client"

import { AlertTriangle, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ConfirmModalProps {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: "danger" | "neutral"
  onConfirm(): void
  onCancel(): void
}

// Bitta umumiy tasdiqlash oynasi — barcha "o'chirish / chiqish" kabi
// halokatli amallar shu komponentdan foydalanadi. window.confirm() o'rniga.
export function ConfirmModal({
  title,
  description,
  confirmLabel = "Tasdiqlash",
  cancelLabel = "Bekor qilish",
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const Icon = tone === "danger" ? Trash2 : AlertTriangle

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <Card
        variant="panel"
        className="w-full max-w-sm p-6"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.14)" }}
      >
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: tone === "danger" ? "rgba(239,68,68,0.08)" : "var(--color-bg-muted)",
          }}
        >
          <Icon size={16} className={tone === "danger" ? "text-red-500" : "text-text-muted"} />
        </div>
        <h3 className="mb-1 text-base font-semibold text-text-primary">{title}</h3>
        <p className="mb-6 text-sm text-text-muted">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border-default py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              tone === "danger"
                ? "flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                : "flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-inkly-hover"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </Card>
    </div>
  )
}