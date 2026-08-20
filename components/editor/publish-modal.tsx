"use client"

/**
 * PublishModal — "Nashr qilish" tugmasi bosilganda chiqadigan modal.
 *
 * Qanday ishlatiladi:
 *
 *   import { PublishModal } from "@/components/editor/publish-modal"
 *
 *   <PublishModal
 *     open={showPublishModal}
 *     onClose={() => setShowPublishModal(false)}
 *     onConfirm={handlePublish}
 *     publishing={publishing}
 *     // sidebar'dagi barcha state'lar:
 *     publicationState={publicationState}
 *     onPublicationState={handlePublicationState}
 *     visibility={visibility}
 *     onVisibility={setVisibility}
 *     categories={categories}
 *     selectedCategories={selectedCategories}
 *     selectedCategoryNames={selectedCategoryNames}
 *     onToggleCategory={toggleCategory}
 *     tags={tags}
 *     tagInput={tagInput}
 *     onTagInputChange={setTagInput}
 *     onTagKeyDown={handleTagKeyDown}
 *     onRemoveTag={removeTag}
 *     excerpt={excerpt}
 *     onExcerpt={setExcerpt}
 *     coverPreviewUrl={coverPreviewUrl}
 *     uploadingCover={uploadingCover}
 *     onCoverUpload={handleCoverUpload}
 *     onRemoveCover={removeCover}
 *     coverInputRef={coverInputRef}
 *     allowComments={allowComments}
 *     onAllowComments={setAllowComments}
 *     allowReactions={allowReactions}
 *     onAllowReactions={setAllowReactions}
 *     allowReposts={allowReposts}
 *     onAllowReposts={setAllowReposts}
 *     seoIndexable={seoIndexable}
 *     onSeoIndexable={setSeoIndexable}
 *     isPinned={isPinned}
 *     onIsPinned={setIsPinned}
 *   />
 */

import { useEffect, useRef } from "react"

import {
  Check,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  Send,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import type {
  CategoryPublicResponse,
  PostVisibility,
} from "@/types/api"

type PublicationState = "draft" | "ready" | "published"

/* =========================================================
   Props
========================================================= */

interface PublishModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  publishing: boolean

  publicationState: PublicationState
  onPublicationState: (value: PublicationState) => void

  visibility: PostVisibility
  onVisibility: (value: PostVisibility) => void

  categories: CategoryPublicResponse[]
  selectedCategories: string[]
  selectedCategoryNames: string[]
  onToggleCategory: (uuid: string) => void

  tags: string[]
  tagInput: string
  onTagInputChange: (value: string) => void
  onTagKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onRemoveTag: (tag: string) => void

  excerpt: string
  onExcerpt: (value: string) => void

  coverPreviewUrl: string
  uploadingCover: boolean
  onCoverUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onRemoveCover: () => void
  coverInputRef: React.RefObject<HTMLInputElement>

  allowComments: boolean
  onAllowComments: (value: boolean) => void
  allowReactions: boolean
  onAllowReactions: (value: boolean) => void
  allowReposts: boolean
  onAllowReposts: (value: boolean) => void
  seoIndexable: boolean
  onSeoIndexable: (value: boolean) => void
  isPinned: boolean
  onIsPinned: (value: boolean) => void
}

/* =========================================================
   Modal
========================================================= */

export function PublishModal({
  open,
  onClose,
  onConfirm,
  publishing,

  publicationState,
  onPublicationState,

  categories,
  selectedCategories,
  selectedCategoryNames,
  onToggleCategory,

  tags,
  tagInput,
  onTagInputChange,
  onTagKeyDown,
  onRemoveTag,

  excerpt,
  onExcerpt,

  coverPreviewUrl,
  uploadingCover,
  onCoverUpload,
  onRemoveCover,
  coverInputRef,

  allowComments,
  onAllowComments,
  allowReactions,
  onAllowReactions,
  allowReposts,
  onAllowReposts,
  seoIndexable,
  onSeoIndexable,
  isPinned,
  onIsPinned,
}: PublishModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  /* Lock body scroll */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      aria-modal="true"
      role="dialog"
      aria-label="Nashr sozlamalari"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 mx-auto flex h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl">

        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-[15px] font-semibold text-[#141414]">
            Nashr sozlamalari
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#141414]"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain"
        >

          {/* === Holat === */}
          <Section title="Holat">
            <div className="space-y-3">
              <StatusRadio
                checked={publicationState === "draft"}
                title="Qoralama"
                description="Faqat siz ko'rasiz"
                onClick={() => onPublicationState("draft")}
              />
              <StatusRadio
                checked={publicationState === "ready"}
                title="Nashrga tayyor"
                description="Ko'rib chiqish uchun"
                onClick={() => onPublicationState("ready")}
              />
              <StatusRadio
                checked={publicationState === "published"}
                title="Nashr etilgan"
                description="Barchaga ochiq"
                onClick={() => onPublicationState("published")}
              />
            </div>
          </Section>

          <Divider />

          {/* === Kontent === */}
          <Section title="Kontent">

            {/* Kategoriyalar */}
            <FieldGroup label="Kategoriyalar">
              <CategorySelect
                categories={categories}
                selectedCategories={selectedCategories}
                selectedNames={selectedCategoryNames}
                onToggle={onToggleCategory}
              />
            </FieldGroup>

            {/* Teglar */}
            <FieldGroup label="Teglar" hint="Enter bosib teg qo'shing · Ko'pi bilan 5 ta">
              <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 focus-within:border-[#FF6A00] transition-colors">
                {tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-[#FFF3E8] px-2 py-1 text-[11px] font-medium text-[#FF6A00]"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => onRemoveTag(tag)}
                          className="hover:text-[#D94600]"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  value={tagInput}
                  onChange={(e) => onTagInputChange(e.target.value)}
                  onKeyDown={onTagKeyDown}
                  placeholder="Teg qo'shish..."
                  className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
                />
              </div>
            </FieldGroup>

            {/* Qisqacha tavsif */}
            <FieldGroup
              label="Qisqacha tavsif"
              right={<span className="text-[11px] text-[#9CA3AF]">{excerpt.length}/160</span>}
            >
              <textarea
                value={excerpt}
                onChange={(e) => onExcerpt(e.target.value)}
                maxLength={160}
                rows={3}
                placeholder="Maqolaga qisqacha tavsif yozing..."
                className="w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm leading-5 outline-none focus:border-[#FF6A00] transition-colors placeholder:text-[#9CA3AF]"
              />
            </FieldGroup>

            {/* Asosiy rasm */}
            <FieldGroup label="Asosiy rasm">
              {coverPreviewUrl ? (
                <div className="group relative overflow-hidden rounded-lg border border-[#E5E7EB]">
                  <img
                    src={coverPreviewUrl}
                    alt="Cover"
                    className="aspect-[1.91/1] w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium"
                    >
                      Almashtirish
                    </button>
                    <button
                      type="button"
                      onClick={onRemoveCover}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-500"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="flex h-[80px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-[#C9CDD2] bg-[#F2F4F7] text-[#6B7280] hover:border-[#FF6A00] hover:bg-[#FFF3E8] transition-colors disabled:pointer-events-none"
                >
                  {uploadingCover ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <ImageIcon size={18} />
                      <span className="mt-1 text-xs font-medium">Rasm yuklash</span>
                      <span className="text-[10px] text-[#9CA3AF]">JPG, PNG yoki WebP · Maks. 5MB</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onCoverUpload}
                className="hidden"
              />
            </FieldGroup>

          </Section>

          <Divider />

          {/* === Qo'shimcha === */}
          <Section title="Qo'shimcha">
            <div className="space-y-3">
              {[
                { checked: allowComments, onChange: onAllowComments, label: "Izohlarga ruxsat berish" },
                { checked: allowReactions, onChange: onAllowReactions, label: "Reaksiyalarga ruxsat berish" },
                { checked: allowReposts, onChange: onAllowReposts, label: "Qayta ulashishga ruxsat berish" },
                { checked: seoIndexable, onChange: onSeoIndexable, label: "Qidiruv tizimlarida ko'rsatish" },
                { checked: isPinned, onChange: onIsPinned, label: "Profilga mahkamlash" },
              ].map(({ checked, onChange, label }) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center gap-2.5 select-none"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${checked
                        ? "border-[#FF6A00] bg-[#FF6A00]"
                        : "border-[#D1D5DB] bg-white"
                      }`}
                    onClick={() => onChange(!checked)}
                  >
                    {checked && <Check size={10} className="text-white" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-sm text-[#374151]">{label}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* Bottom padding for scroll */}
          <div className="h-4" />
        </div>

        {/* ── Footer (Sticky) ── */}
        <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={publishing}
              className="h-10 flex-1 rounded-lg border-[#E5E7EB] text-sm font-medium text-[#374151]"
            >
              Bekor qilish
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={publishing}
              className="h-10 flex-[2] rounded-lg bg-[#FF6A00] text-sm font-semibold text-white hover:bg-[#E85F00] disabled:opacity-60"
            >
              {publishing ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Nashr qilinmoqda...
                </>
              ) : (
                <>
                  Nashr qilish
                  <Send size={14} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

/* =========================================================
   Helpers
========================================================= */

function Divider() {
  return <div className="mx-6 h-px bg-[#E8E3DD]" />
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="px-6 py-5">
      <h3 className="mb-4 text-sm font-semibold text-[#141414]">{title}</h3>
      {children}
    </section>
  )
}

function FieldGroup({
  label,
  hint,
  right,
  children,
}: {
  label: string
  hint?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-semibold text-[#24292E]">{label}</label>
        {right}
      </div>
      {children}
      {hint && (
        <p className="mt-1.5 text-[10px] text-[#6B7280]">{hint}</p>
      )}
    </div>
  )
}

function StatusRadio({
  checked,
  title,
  description,
  onClick,
}: {
  checked: boolean
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-2.5 text-left"
    >
      <span
        className={`mt-0.5 flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border transition-colors ${checked ? "border-[#FF6A00]" : "border-[#7D8389]"
          }`}
      >
        {checked && (
          <span className="h-[6px] w-[6px] rounded-full bg-[#FF6A00]" />
        )}
      </span>
      <span className="min-w-0">
        <span
          className={`block text-[13px] font-medium ${checked ? "text-[#141414]" : "text-[#34393E]"
            }`}
        >
          {title}
        </span>
        <span className="mt-0.5 block text-[11px] leading-4 text-[#7C8288]">
          {description}
        </span>
      </span>
    </button>
  )
}

/* =========================================================
   Category Select (same as page, self-contained)
========================================================= */

import { useState } from "react"

function CategorySelect({
  categories,
  selectedCategories,
  selectedNames,
  onToggle,
}: {
  categories: CategoryPublicResponse[]
  selectedCategories: string[]
  selectedNames: string[]
  onToggle: (uuid: string) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 text-left text-sm text-[#6B7280] outline-none hover:border-[#D1D5DB] transition-colors"
      >
        <span className="truncate">
          {selectedNames.length ? selectedNames.join(", ") : "Kategoriyani tanlang"}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-10 z-50 max-h-48 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-lg">
          {categories.length === 0 ? (
            <div className="px-3 py-3 text-sm text-[#9CA3AF]">Kategoriyalar topilmadi</div>
          ) : (
            categories.map((cat) => {
              const selected = selectedCategories.includes(cat.uuid)
              return (
                <button
                  key={cat.uuid}
                  type="button"
                  onClick={() => onToggle(cat.uuid)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-[#FFF3E8]"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected
                        ? "border-[#FF6A00] bg-[#FF6A00] text-white"
                        : "border-[#D1D5DB]"
                      }`}
                  >
                    {selected && <Check size={11} />}
                  </span>
                  <span className="truncate">{cat.name}</span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}