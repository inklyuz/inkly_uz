"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"

import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Send,
  X,
} from "lucide-react"

import { ArticlePreview } from "@/components/editor/article-preview"
import { PublishModal } from "@/components/editor/publish-modal"

import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { uploadsApi } from "@/lib/api/uploads"
import { categoriesApi } from "@/lib/api/categories"

import type {
  CategoryPublicResponse,
  PostVisibility,
} from "@/types/api"

const InklyEditorNovel = dynamic(
  () =>
    import("@/components/editor/inkly-editor-novel").then(
      (mod) => mod.InklyEditorNovel,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#FF6A00]" />
      </div>
    ),
  },
)

/* =========================================================
   Types
========================================================= */

type SaveStatus = "idle" | "saving" | "saved" | "error"
type PublicationState = "draft" | "ready" | "published"

const AUTOSAVE_DELAY_MS = 5_000

function htmlToPlainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/* =========================================================
   Page
========================================================= */

export default function WriteEditorPage() {
  const { state } = useAuth()
  const { user, token, loading } = state

  const router = useRouter()
  const searchParams = useSearchParams()

  const editUuid = searchParams.get("edit")
  const isEditing = Boolean(editUuid)

  /* =======================================================
     Article state
  ======================================================= */

  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")

  const [cover, setCover] = useState("")
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("")

  const [visibility, setVisibility] = useState<PostVisibility>("public")

  const [categories, setCategories] = useState<CategoryPublicResponse[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  /* =======================================================
     UI state
  ======================================================= */

  const [publicationState, setPublicationState] =
    useState<PublicationState>("draft")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)

  const [allowComments, setAllowComments] = useState(true)
  const [allowReactions, setAllowReactions] = useState(true)
  const [allowReposts, setAllowReposts] = useState(true)
  const [seoIndexable, setSeoIndexable] = useState(true)
  const [isPinned, setIsPinned] = useState(false)
  const [scheduledAt, setScheduledAt] = useState<string | null>(null)

  const [uploadingCover, setUploadingCover] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* =======================================================
     Refs
  ======================================================= */

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedUuidRef = useRef<string | null>(editUuid)
  const saveRequestIdRef = useRef(0)
  const lastSavedSignatureRef = useRef("")
  const coverInputRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const excerptRef = useRef<HTMLTextAreaElement>(null)

  /* =======================================================
     Authentication
  ======================================================= */

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  /* =======================================================
     Textarea auto resize
  ======================================================= */

  const resizeTextarea = useCallback(
    (element: HTMLTextAreaElement | null) => {
      if (!element) return
      element.style.height = "auto"
      element.style.height = `${element.scrollHeight}px`
    },
    [],
  )

  useEffect(() => {
    resizeTextarea(titleRef.current)
  }, [title, resizeTextarea])

  useEffect(() => {
    resizeTextarea(excerptRef.current)
  }, [excerpt, resizeTextarea])

  /* =======================================================
     Load categories
  ======================================================= */

  useEffect(() => {
    let cancelled = false
    categoriesApi
      .list({ page_size: 50 })
      .then((response) => {
        if (cancelled) return
        setCategories(response.items)
      })
      .catch(() => { })
    return () => {
      cancelled = true
    }
  }, [])

  /* =======================================================
     Load post for edit
  ======================================================= */

  useEffect(() => {
    if (!editUuid || !token) return
    let cancelled = false

    postsApi
      .myGet(token, editUuid)
      .then((post) => {
        if (cancelled) return

        setTitle(post.title ?? "")
        setExcerpt(post.excerpt ?? "")
        setContent(post.content ?? "")
        setCover(post.cover ?? "")
        setCoverPreviewUrl(post.cover ?? "")
        setVisibility(post.visibility ?? "public")
        setAllowComments(post.allow_comments ?? true)
        setAllowReactions(post.allow_reactions ?? true)
        setAllowReposts(true)
        setSeoIndexable(post.seo_indexable ?? true)
        setIsPinned(post.is_pinned ?? false)
        setScheduledAt(post.scheduled_at ?? null)
        setTags(post.tags ?? [])
        setSelectedCategories(
          post.categories?.map((category) => category.uuid) ?? [],
        )
        savedUuidRef.current = post.uuid
        lastSavedSignatureRef.current = JSON.stringify({
          title: (post.title ?? "").trim(),
          content: post.content ?? "",
          excerpt: (post.excerpt ?? "").trim() || undefined,
          cover: post.cover || undefined,
          visibility: post.visibility ?? "public",
          categories: post.categories?.map((category) => category.uuid) ?? [],
          tags: post.tags ?? [],
          seo_indexable: post.seo_indexable ?? true,
          allow_comments: post.allow_comments ?? true,
          allow_reactions: post.allow_reactions ?? true,
          allow_reposts: true,
          is_pinned: post.is_pinned ?? false,
          scheduled_at: post.scheduled_at ?? null,
        })
        setSaveStatus("saved")
        setSavedAt(new Date())
        setPublicationState("draft")
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err instanceof Error ? err.message : "Maqolani yuklashda xatolik",
        )
      })

    return () => {
      cancelled = true
    }
  }, [editUuid, token])

  /* =======================================================
     Build post data
  ======================================================= */

  const buildPostData = useCallback(() => {
    return {
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || undefined,
      cover: cover || undefined,
      visibility,
      categories: selectedCategories,
      tags,
      seo_indexable: seoIndexable,
      allow_comments: allowComments,
      allow_reactions: allowReactions,
      allow_reposts: allowReposts,
      is_pinned: isPinned,
      scheduled_at: scheduledAt,
    }
  }, [
    title,
    content,
    excerpt,
    cover,
    visibility,
    selectedCategories,
    tags,
    allowComments,
    allowReactions,
    allowReposts,
    seoIndexable,
    isPinned,
    scheduledAt,
  ])

  const draftSignature = useMemo(
    () => JSON.stringify(buildPostData()),
    [buildPostData],
  )
  const hasContent = htmlToPlainText(content).length > 0
  const hasDraftInput = Boolean(
    title.trim() ||
      hasContent ||
      excerpt.trim() ||
      cover ||
      selectedCategories.length ||
      tags.length,
  )
  const isDirty = hasDraftInput && draftSignature !== lastSavedSignatureRef.current

  useEffect(() => {
    if (isDirty && saveStatus !== "saving") {
      setSaveStatus("idle")
    }
  }, [isDirty, saveStatus])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  /* =======================================================
     Save draft
  ======================================================= */

  const saveDraft = useCallback(
    async (showError = true) => {
      if (!token) return
      if (!title.trim()) {
        if (showError && hasContent) {
          setError("Qoralama saqlash uchun sarlavha kiriting.")
        }
        return
      }

      const requestId = ++saveRequestIdRef.current
      setSaveStatus("saving")

      try {
        const data = buildPostData()
        let uuid = savedUuidRef.current

        if (uuid) {
          await postsApi.update(token, uuid, data)
        } else {
          const post = await postsApi.create(token, data)
          uuid = post.uuid
          savedUuidRef.current = uuid
        }

        if (requestId === saveRequestIdRef.current) {
          lastSavedSignatureRef.current = JSON.stringify(data)
          setSaveStatus("saved")
          setSavedAt(new Date())
          setPublicationState("draft")
        }
      } catch (err) {
        if (requestId !== saveRequestIdRef.current) return
        setSaveStatus("error")
        if (showError) {
          setError(err instanceof Error ? err.message : "Saqlashda xatolik")
        }
      }
    },
    [token, title, hasContent, buildPostData],
  )

  /* =======================================================
     Autosave
  ======================================================= */

  useEffect(() => {
    if (!token) return
    if (!isDirty || !title.trim()) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    saveTimerRef.current = setTimeout(() => {
      saveDraft(false)
    }, AUTOSAVE_DELAY_MS)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [token, isDirty, title, saveDraft])

  /* =======================================================
     Manual save
  ======================================================= */

  const handleSaveDraft = async () => {
    setError(null)
    await saveDraft(true)
  }

  /* =======================================================
     Cover upload
  ======================================================= */

  const handleCoverUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || !token) return

    setError(null)

    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayllarini yuklash mumkin.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Rasm hajmi 5MB dan oshmasligi kerak.")
      return
    }

    setUploadingCover(true)
    try {
      const upload = await uploadsApi.cover(token, file)
      setCover(upload.path)
      setCoverPreviewUrl(upload.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rasm yuklashda xatolik")
    } finally {
      setUploadingCover(false)
    }
  }

  const removeCover = () => {
    setCover("")
    setCoverPreviewUrl("")
  }

  /* =======================================================
     Categories
  ======================================================= */

  const toggleCategory = (uuid: string) => {
    setSelectedCategories((current) =>
      current.includes(uuid)
        ? current.filter((id) => id !== uuid)
        : [...current, uuid],
    )
  }

  const selectedCategoryNames = useMemo(() => {
    return categories
      .filter((category) => selectedCategories.includes(category.uuid))
      .map((category) => category.name)
  }, [categories, selectedCategories])

  /* =======================================================
     Tags
  ======================================================= */

  const addTag = () => {
    const normalized = tagInput.trim().replace(/^#/, "")
    if (!normalized) return
    if (tags.some((tag) => tag.toLowerCase() === normalized.toLowerCase())) {
      setTagInput("")
      return
    }
    if (tags.length >= 5) {
      setError("Ko'pi bilan 5 ta teg qo'shish mumkin.")
      return
    }
    setTags((current) => [...current, normalized])
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    setTags((current) => current.filter((item) => item !== tag))
  }

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addTag()
      return
    }
    if (event.key === "Backspace" && !tagInput && tags.length) {
      setTags((current) => current.slice(0, -1))
    }
  }

  /* =======================================================
     Publication state
  ======================================================= */

  const handlePublicationState = (value: PublicationState) => {
    setPublicationState(value)
    if (value === "published") setVisibility("public")
    if (value === "draft") setVisibility("private")
  }

  /* =======================================================
     Open publish modal
  ======================================================= */

  const handleOpenPublishModal = () => {
    if (!title.trim()) {
      setError("Sarlavha majburiy.")
      return
    }
    if (!hasContent) {
      setError("Maqola matni bo'sh bo'lishi mumkin emas.")
      return
    }
    setError(null)
    setShowPublishModal(true)
  }

  /* =======================================================
     Publish
  ======================================================= */

  const handlePublish = async () => {
    if (!token || publishing) return
    if (!title.trim() || !hasContent) {
      setError("Sarlavha va maqola matni majburiy.")
      return
    }

    setPublishing(true)
    setError(null)

    try {
      const data = buildPostData()
      let uuid = savedUuidRef.current

      if (!uuid) {
        const post = await postsApi.create(token, data)
        uuid = post.uuid
        savedUuidRef.current = uuid
      }

      const publishedPost = await postsApi.publish(token, uuid, { ...data })

      lastSavedSignatureRef.current = JSON.stringify(data)
      setPublicationState("published")
      setSaveStatus("saved")
      setSavedAt(new Date())
      setShowPublishModal(false)

      router.push(`/${publishedPost.author.username}/${publishedPost.slug}`)
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nashr qilishda xatolik",
      )
    } finally {
      setPublishing(false)
    }
  }

  const handleBack = () => {
    if (isDirty && !window.confirm("Saqlanmagan o'zgarishlar bor. Chiqib ketasizmi?")) {
      return
    }
    router.push("/dashboard/posts")
  }

  /* =======================================================
     Loading
  ======================================================= */

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-[#FF6A00]" />
      </div>
    )
  }

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="write-page-root">

      {/* =====================================================
          Minimal top bar
      ===================================================== */}
      <header className="write-topbar">

        {/* Left: back + save status */}
        <div className="write-topbar-left">
          <button
            type="button"
            onClick={handleBack}
            className="write-back-btn"
            title="Yozishga qaytish"
            aria-label="Yozishga qaytish"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="write-save-status">
            {saveStatus === "saving" && (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check size={12} className="text-green-500" />
                <span>
                  {savedAt
                    ? `Saqlangan ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : "Saqlangan"}
                </span>
              </>
            )}
            {saveStatus === "error" && (
              <span className="text-red-500">Saqlanmadi</span>
            )}
            {saveStatus === "idle" && (
              <span>Saqlanmagan</span>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="write-topbar-right">

          {/* Preview toggle */}
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            title={showPreview ? "Yozishga qaytish" : "Oldindan ko'rish"}
            className={`write-action-btn ${showPreview ? "write-action-btn--active" : ""}`}
          >
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
            <span className="write-action-label">
              {showPreview ? "Tahrirlash" : "Ko'rish"}
            </span>
          </button>

          {/* Save draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saveStatus === "saving" || !title.trim()}
            className="write-action-btn"
          >
            <span>Qoralama</span>
          </button>

          {/* Publish */}
          <button
            type="button"
            onClick={handleOpenPublishModal}
            disabled={
              publishing ||
              uploadingCover ||
              !title.trim() ||
              !hasContent
            }
            className="write-publish-btn"
          >
            {publishing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            <span>Nashr qilish</span>
          </button>
        </div>
      </header>

      {/* =====================================================
          Error banner
      ===================================================== */}
      {error && (
        <div className="write-error-banner">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="write-error-close"
            aria-label="Xatoni yopish"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =====================================================
          Writing canvas
      ===================================================== */}
      <main className="write-canvas">
        <div className="write-canvas-inner">

          {showPreview ? (
            /* -----------------------------------------------
               Preview
            ----------------------------------------------- */
            <div className="write-preview-wrap">
              <div className="write-preview-bar">
                <Eye size={13} />
                <span>Oldindan ko'rish</span>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="write-preview-close"
                >
                  <EyeOff size={13} />
                  Tahrirlashga qaytish
                </button>
              </div>
              <ArticlePreview
                title={title}
                excerpt={excerpt}
                content={content}
                cover={coverPreviewUrl}
              />
            </div>
          ) : (
            /* -----------------------------------------------
               Editor
            ----------------------------------------------- */
            <>
              {/* Cover image */}
              {coverPreviewUrl && (
                <div className="write-cover-wrap">
                  <img
                    src={coverPreviewUrl}
                    alt="Cover"
                    className="write-cover-img"
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    className="write-cover-remove"
                    title="Rasmni olib tashlash"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Cover add button (no cover yet) */}
              {!coverPreviewUrl && (
                <div className="write-cover-add">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="write-cover-add-btn"
                  >
                    {uploadingCover ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <span>+ Muqova rasm qo'shish</span>
                    )}
                  </button>
                </div>
              )}

              {/* Title */}
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sarlavha..."
                rows={1}
                maxLength={180}
                className="write-title"
              />

              {/* Excerpt */}
              <textarea
                ref={excerptRef}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Qisqacha tavsif (ixtiyoriy)..."
                rows={1}
                maxLength={160}
                className="write-excerpt"
              />

              {/* Divider */}
              <div className="write-divider" />

              {/* Body editor */}
              <InklyEditorNovel
                content={content}
                onChange={setContent}
                token={token}
                placeholder="Yozing yoki '/' bosing..."
              />
            </>
          )}
        </div>
      </main>

      {/* =====================================================
          Publish Modal
      ===================================================== */}
      <PublishModal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublish}
        publishing={publishing}
        publicationState={publicationState}
        onPublicationState={handlePublicationState}
        visibility={visibility}
        onVisibility={setVisibility}
        categories={categories}
        selectedCategories={selectedCategories}
        selectedCategoryNames={selectedCategoryNames}
        onToggleCategory={toggleCategory}
        tags={tags}
        tagInput={tagInput}
        onTagInputChange={setTagInput}
        onTagKeyDown={handleTagKeyDown}
        onRemoveTag={removeTag}
        excerpt={excerpt}
        onExcerpt={setExcerpt}
        coverPreviewUrl={coverPreviewUrl}
        uploadingCover={uploadingCover}
        onCoverUpload={handleCoverUpload}
        onRemoveCover={removeCover}
        coverInputRef={coverInputRef}
        allowComments={allowComments}
        onAllowComments={setAllowComments}
        allowReactions={allowReactions}
        onAllowReactions={setAllowReactions}
        allowReposts={allowReposts}
        onAllowReposts={setAllowReposts}
        seoIndexable={seoIndexable}
        onSeoIndexable={setSeoIndexable}
        isPinned={isPinned}
        onIsPinned={setIsPinned}
      />

      {/* =====================================================
          Styles
      ===================================================== */}
      <style jsx global>{`
        /* =====================================================
           Page root — fills the layout's content area
           The layout provides the left nav; we just override
           the background and remove dashboard chrome
        ===================================================== */

        .write-page-root {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          background: #FFFFFF;
        }

        /* =====================================================
           Top bar — minimal writing controls
        ===================================================== */

        .write-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 52px;
          padding: 0 24px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #F0EDE9;
        }

        .write-topbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .write-back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          color: #6B7280;
          text-decoration: none;
          transition: background 0.1s, color 0.1s;
        }

        .write-back-btn:hover {
          background: #F3F4F6;
          color: #141414;
        }

        .write-save-status {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #9CA3AF;
          font-family: Inter, sans-serif;
        }

        .write-topbar-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .write-action-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          height: 32px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          background: white;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          transition: background 0.1s, border-color 0.1s;
          font-family: Inter, sans-serif;
        }

        .write-action-btn:hover {
          background: #F9FAFB;
        }

        .write-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .write-action-btn--active {
          border-color: #FF6A00;
          background: #FFF3E8;
          color: #FF6A00;
        }

        .write-action-label {
          display: none;
        }

        @media (min-width: 640px) {
          .write-action-label {
            display: inline;
          }
        }

        .write-publish-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 14px;
          border-radius: 8px;
          border: none;
          background: #FF6A00;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          font-family: Inter, sans-serif;
        }

        .write-publish-btn:hover {
          background: #E85F00;
        }

        .write-publish-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* =====================================================
           Error banner
        ===================================================== */

        .write-error-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 24px;
          background: #FEF2F2;
          border-bottom: 1px solid #FECACA;
          font-size: 13px;
          color: #DC2626;
          font-family: Inter, sans-serif;
        }

        .write-error-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #DC2626;
          transition: background 0.1s;
        }

        .write-error-close:hover {
          background: #FEE2E2;
        }

        /* =====================================================
           Writing canvas — centered, comfortable width
        ===================================================== */

        .write-canvas {
          flex: 1;
          overflow-y: auto;
          padding: 0 24px 80px;
        }

        .write-canvas-inner {
          max-width: 720px;
          margin: 0 auto;
          padding-top: 48px;
        }

        /* =====================================================
           Cover image
        ===================================================== */

        .write-cover-add {
          margin-bottom: 28px;
        }

        .write-cover-add-btn {
          font-size: 12px;
          color: #9CA3AF;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: Inter, sans-serif;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.1s;
        }

        .write-cover-add-btn:hover {
          color: #6B7280;
        }

        .write-cover-add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .write-cover-wrap {
          position: relative;
          margin-bottom: 36px;
          border-radius: 14px;
          overflow: hidden;
        }

        .write-cover-img {
          display: block;
          width: 100%;
          aspect-ratio: 1.91 / 1;
          object-fit: cover;
        }

        .write-cover-remove {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: none;
          background: rgba(0, 0, 0, 0.55);
          color: white;
          cursor: pointer;
          transition: background 0.1s;
        }

        .write-cover-remove:hover {
          background: rgba(0, 0, 0, 0.75);
        }

        /* =====================================================
           Title + Excerpt
        ===================================================== */

        .write-title {
          display: block;
          width: 100%;
          resize: none;
          overflow: hidden;
          background: transparent;
          border: none;
          outline: none;
          font-family: Inter, "Helvetica Neue", Arial, sans-serif;
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #141414;
          margin-bottom: 12px;
        }

        .write-title::placeholder {
          color: #C4C8CC;
        }

        .write-excerpt {
          display: block;
          width: 100%;
          resize: none;
          overflow: hidden;
          background: transparent;
          border: none;
          outline: none;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          line-height: 1.65;
          color: #6B7280;
          margin-bottom: 28px;
        }

        .write-excerpt::placeholder {
          color: #C4C8CC;
        }

        .write-divider {
          height: 1px;
          background: #EFEFEF;
          margin-bottom: 4px;
        }

        /* =====================================================
           Preview wrapper
        ===================================================== */

        .write-preview-wrap {
          background: white;
          border-radius: 14px;
          border: 1px solid #F0EDE9;
          overflow: hidden;
        }

        .write-preview-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #F2F4F7;
          border-bottom: 1px solid #F0EDE9;
          font-size: 12px;
          color: #9CA3AF;
          font-family: Inter, sans-serif;
        }

        .write-preview-close {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-left: auto;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 12px;
          color: #FF6A00;
          font-family: Inter, sans-serif;
          transition: color 0.1s;
        }

        .write-preview-close:hover {
          color: #E85F00;
        }

        /* =====================================================
           Mobile adjustments
        ===================================================== */

        @media (max-width: 640px) {
          .write-topbar {
            padding: 0 16px;
          }

          .write-canvas {
            padding: 0 16px 60px;
          }

          .write-canvas-inner {
            padding-top: 32px;
          }
        }
      `}</style>
    </div>
  )
}
