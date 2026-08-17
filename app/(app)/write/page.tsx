"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { useRouter, useSearchParams } from "next/navigation"

import {
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Eye,
  Image as ImageIcon,
  Loader2,
  MoreVertical,
  Send,
  X,
} from "lucide-react"

import { InklyEditorV2 } from "@/components/editor/inkly-editor"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

import { useAuth } from "@/lib/auth/context"
import { postsApi } from "@/lib/api/posts"
import { uploadsApi } from "@/lib/api/uploads"
import { categoriesApi } from "@/lib/api/categories"

import type {
  CategoryPublicResponse,
  PostVisibility,
} from "@/types/api"

/* =========================================================
   Types
========================================================= */

type SaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "error"

type PublicationState =
  | "draft"
  | "ready"
  | "published"

/* =========================================================
   Page
========================================================= */

export default function WritePage() {
  const { state } = useAuth()
  const { user, token, loading } = state

  const router = useRouter()
  const searchParams = useSearchParams()

  const editUuid = searchParams.get("edit")
  const isEditing = Boolean(editUuid)

  /* =======================================================
     Article
  ======================================================= */

  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")

  const [cover, setCover] = useState("")
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("")

  const [visibility, setVisibility] =
    useState<PostVisibility>("public")

  const [categories, setCategories] = useState<
    CategoryPublicResponse[]
  >([])

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([])

  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  /* =======================================================
     UI
  ======================================================= */

  const [publicationState, setPublicationState] =
    useState<PublicationState>("draft")

  const [saveStatus, setSaveStatus] =
    useState<SaveStatus>("idle")

  const [savedAt, setSavedAt] =
    useState<Date | null>(null)

  const [showPreview, setShowPreview] =
    useState(false)

  const [allowComments, setAllowComments] =
    useState(true)

  const [uploadingCover, setUploadingCover] =
    useState(false)

  const [publishing, setPublishing] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [savedUuid, setSavedUuid] =
    useState<string | null>(editUuid)

  /* =======================================================
     Refs
  ======================================================= */

  const saveTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveRequestIdRef =
    useRef(0)

  const coverInputRef =
    useRef<HTMLInputElement>(null)

  const titleRef =
    useRef<HTMLTextAreaElement>(null)

  const excerptRef =
    useRef<HTMLTextAreaElement>(null)

  /* =======================================================
     Authentication
  ======================================================= */

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [
    loading,
    user,
    router,
  ])

  /* =======================================================
     Textarea auto resize
  ======================================================= */

  const resizeTextarea = useCallback(
    (
      element: HTMLTextAreaElement | null,
    ) => {
      if (!element) return

      element.style.height = "auto"
      element.style.height =
        `${element.scrollHeight}px`
    },
    [],
  )

  useEffect(() => {
    resizeTextarea(titleRef.current)
  }, [
    title,
    resizeTextarea,
  ])

  useEffect(() => {
    resizeTextarea(excerptRef.current)
  }, [
    excerpt,
    resizeTextarea,
  ])

  /* =======================================================
     Load categories
  ======================================================= */

  useEffect(() => {
    let cancelled = false

    categoriesApi
      .list({
        page_size: 50,
      })
      .then((response) => {
        if (cancelled) return

        setCategories(response.items)
      })
      .catch(() => {
        // Category loading is not fatal.
      })

    return () => {
      cancelled = true
    }
  }, [])

  /* =======================================================
     Load post for edit
  ======================================================= */

  useEffect(() => {
    if (!editUuid || !token) {
      return
    }

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

        setVisibility(
          post.visibility ?? "public",
        )

        setSelectedCategories(
          post.categories?.map(
            (category) => category.uuid,
          ) ?? [],
        )

        setSavedUuid(post.uuid)

        setSaveStatus("saved")
        setSavedAt(new Date())

        setPublicationState("draft")
      })
      .catch((err) => {
        if (cancelled) return

        setError(
          err instanceof Error
            ? err.message
            : "Maqolani yuklashda xatolik",
        )
      })

    return () => {
      cancelled = true
    }
  }, [
    editUuid,
    token,
  ])

  /* =======================================================
     Build post data
  ======================================================= */

  const buildPostData = useCallback(() => {
    return {
      title: title.trim(),

      content,

      excerpt:
        excerpt.trim() ||
        undefined,

      cover:
        cover ||
        undefined,

      visibility,

      categories:
        selectedCategories,
    }
  }, [
    title,
    content,
    excerpt,
    cover,
    visibility,
    selectedCategories,
  ])

  /* =======================================================
     Save draft
  ======================================================= */

  const saveDraft = useCallback(
    async (
      showError = true,
    ) => {
      if (!token) return
      if (!title.trim()) return

      const requestId =
        ++saveRequestIdRef.current

      setSaveStatus("saving")

      try {
        const data =
          buildPostData()

        let uuid =
          savedUuid

        if (uuid) {
          await postsApi.update(
            token,
            uuid,
            data,
          )
        } else {
          const post =
            await postsApi.create(
              token,
              data,
            )

          uuid = post.uuid

          setSavedUuid(uuid)
        }

        if (
          requestId ===
          saveRequestIdRef.current
        ) {
          setSaveStatus("saved")
          setSavedAt(new Date())
          setPublicationState("draft")
        }
      } catch (err) {
        if (
          requestId !==
          saveRequestIdRef.current
        ) {
          return
        }

        setSaveStatus("error")

        if (showError) {
          setError(
            err instanceof Error
              ? err.message
              : "Saqlashda xatolik",
          )
        }
      }
    },
    [
      token,
      title,
      buildPostData,
      savedUuid,
    ],
  )

  /* =======================================================
     Autosave
  ======================================================= */

  useEffect(() => {
    if (!token) return

    if (
      !title.trim() &&
      !content.trim()
    ) {
      return
    }

    if (saveTimerRef.current) {
      clearTimeout(
        saveTimerRef.current,
      )
    }

    saveTimerRef.current =
      setTimeout(() => {
        saveDraft(false)
      }, 30_000)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(
          saveTimerRef.current,
        )
      }
    }
  }, [
    title,
    excerpt,
    content,
    cover,
    visibility,
    selectedCategories,
    token,
    saveDraft,
  ])

  /* =======================================================
     Manual save
  ======================================================= */

  const handleSaveDraft =
    async () => {
      setError(null)

      await saveDraft(true)
    }

  /* =======================================================
     Cover upload
  ======================================================= */

  const handleCoverUpload =
    async (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0]

      event.target.value = ""

      if (!file || !token) {
        return
      }

      setError(null)

      if (
        !file.type.startsWith("image/")
      ) {
        setError(
          "Faqat rasm fayllarini yuklash mumkin.",
        )
        return
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        setError(
          "Rasm hajmi 5MB dan oshmasligi kerak.",
        )
        return
      }

      setUploadingCover(true)

      try {
        const upload =
          await uploadsApi.postImage(
            token,
            file,
          )

        setCover(upload.path)
        setCoverPreviewUrl(
          upload.url,
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Rasm yuklashda xatolik",
        )
      } finally {
        setUploadingCover(false)
      }
    }

  /* =======================================================
     Remove cover
  ======================================================= */

  const removeCover = () => {
    setCover("")
    setCoverPreviewUrl("")
  }

  /* =======================================================
     Categories
  ======================================================= */

  const toggleCategory = (
    uuid: string,
  ) => {
    setSelectedCategories(
      (current) =>
        current.includes(uuid)
          ? current.filter(
              (id) => id !== uuid,
            )
          : [
              ...current,
              uuid,
            ],
    )
  }

  const selectedCategoryNames =
    useMemo(() => {
      return categories
        .filter((category) =>
          selectedCategories.includes(
            category.uuid,
          ),
        )
        .map(
          (category) =>
            category.name,
        )
    }, [
      categories,
      selectedCategories,
    ])

  /* =======================================================
     Tags
  ======================================================= */

  const addTag = () => {
    const normalized =
      tagInput
        .trim()
        .replace(/^#/, "")

    if (!normalized) return

    if (
      tags.some(
        (tag) =>
          tag.toLowerCase() ===
          normalized.toLowerCase(),
      )
    ) {
      setTagInput("")
      return
    }

    if (tags.length >= 5) {
      setError(
        "Ko‘pi bilan 5 ta teg qo‘shish mumkin.",
      )
      return
    }

    setTags((current) => [
      ...current,
      normalized,
    ])

    setTagInput("")
  }

  const removeTag = (
    tag: string,
  ) => {
    setTags((current) =>
      current.filter(
        (item) =>
          item !== tag,
      ),
    )
  }

  const handleTagKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault()
      addTag()
      return
    }

    if (
      event.key === "Backspace" &&
      !tagInput &&
      tags.length
    ) {
      setTags((current) =>
        current.slice(0, -1),
      )
    }
  }

  /* =======================================================
     Publication state
  ======================================================= */

  const handlePublicationState =
    (
      value: PublicationState,
    ) => {
      setPublicationState(value)

      if (value === "published") {
        setVisibility("public")
      }

      if (value === "draft") {
        setVisibility("private")
      }
    }

  /* =======================================================
     Publish
  ======================================================= */

  const handlePublish =
    async () => {
      if (!token) return

      if (!title.trim()) {
        setError(
          "Sarlavha majburiy.",
        )
        return
      }

      if (!content.trim()) {
        setError(
          "Maqola matni bo‘sh bo‘lishi mumkin emas.",
        )
        return
      }

      setPublishing(true)
      setError(null)

      try {
        const data =
          buildPostData()

        let uuid =
          savedUuid

        if (uuid) {
          await postsApi.update(
            token,
            uuid,
            data,
          )
        } else {
          const post =
            await postsApi.create(
              token,
              data,
            )

          uuid = post.uuid

          setSavedUuid(uuid)
        }

        await postsApi.publish(
          token,
          uuid,
          {
            visibility: "public",

            categories:
              selectedCategories,

            cover:
              cover ||
              undefined,

            excerpt:
              excerpt.trim() ||
              undefined,
          },
        )

        setPublicationState(
          "published",
        )

        setSaveStatus("saved")
        setSavedAt(new Date())

        router.push(
          `/@${user?.username}`,
        )

        router.refresh()
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Nashr qilishda xatolik",
        )
      } finally {
        setPublishing(false)
      }
    }

  /* =======================================================
     Statistics
  ======================================================= */

  const plainText =
    useMemo(() => {
      return content
        .replace(
          /<[^>]*>/g,
          " ",
        )
        .replace(
          /&nbsp;/g,
          " ",
        )
        .trim()
    }, [content])

  const wordCount =
    useMemo(() => {
      if (!plainText) return 0

      return plainText
        .split(/\s+/)
        .filter(Boolean)
        .length
    }, [plainText])

  const characterCount =
    plainText.length

  const readingTime =
    Math.max(
      1,
      Math.ceil(
        wordCount / 200,
      ),
    )

  /* =======================================================
     Save status
  ======================================================= */

  const saveText =
    useMemo(() => {
      if (
        saveStatus === "saving"
      ) {
        return "Saqlanmoqda..."
      }

      if (
        saveStatus === "error"
      ) {
        return "Saqlanmadi"
      }

      if (
        saveStatus === "saved"
      ) {
        return savedAt
          ? "Saqlangan: hozirgina"
          : "Saqlangan"
      }

      return "Saqlanmagan"
    }, [
      saveStatus,
      savedAt,
    ])

  /* =======================================================
     Loading
  ======================================================= */

  if (
    loading ||
    !user
  ) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2
          size={28}
          className="animate-spin text-[#FF5A00]"
        />
      </div>
    )
  }

  /* =======================================================
     Render
  ======================================================= */

  return (
    <main className="min-h-full bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1500px] px-6 py-5">

        {/* =================================================
            Breadcrumb
        ================================================= */}

        <div className="mb-5 flex items-center gap-2 text-xs text-[#6B7280]">
          <span>
            Bosh sahifa
          </span>

          <ChevronRight
            size={13}
          />

          <span className="text-[#141414]">
            Yozish
          </span>
        </div>

        {/* =================================================
            Header
        ================================================= */}

        <header className="mb-5 flex items-center justify-between">

          <div className="flex items-center gap-5">

            <h1 className="text-[25px] font-bold tracking-tight text-[#141414]">
              {isEditing
                ? "Maqolani tahrirlash"
                : "Yangi maqola"}
            </h1>

            <div className="h-5 w-px bg-[#E5E7EB]" />

            <div className="flex items-center gap-2 text-sm text-[#6B7280]">

              {saveStatus ===
              "saving" ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />

                  <span>
                    Saqlanmoqda...
                  </span>
                </>
              ) : saveStatus ===
                "saved" ? (
                <>
                  <span>
                    {saveText}
                  </span>

                  <Check
                    size={15}
                    className="text-green-500"
                  />
                </>
              ) : saveStatus ===
                "error" ? (
                <span className="text-red-500">
                  Saqlanmadi
                </span>
              ) : (
                <span>
                  Saqlanmagan
                </span>
              )}

            </div>
          </div>

          <div className="flex items-center gap-2">

            <Button
              type="button"
              variant="outline"
              onClick={
                handleSaveDraft
              }
              disabled={
                saveStatus ===
                  "saving" ||
                !title.trim()
              }
              className="
                h-10
                rounded-lg
                border-[#E5E7EB]
                bg-white
                px-4
                text-sm
                font-medium
              "
            >
              Qoralama sifatida saqlash
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={!savedUuid}
              onClick={() => {
                if (!savedUuid) {
                  return
                }

                router.push(
                  `/preview/${savedUuid}`,
                )
              }}
              className="
                h-10
                w-11
                rounded-lg
                border-[#E5E7EB]
                bg-white
                p-0
              "
            >
              <Eye
                size={17}
              />
            </Button>

            <Button
              type="button"
              variant="outline"
              className="
                h-10
                w-11
                rounded-lg
                border-[#E5E7EB]
                bg-white
                p-0
              "
            >
              <MoreVertical
                size={17}
              />
            </Button>

          </div>
        </header>

        {/* =================================================
            Error
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
              className="rounded-md p-1 hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =================================================
            Workspace
        ================================================= */}

        <div className="grid grid-cols-[minmax(0,1fr)_265px] gap-5">

          {/* =================================================
              Editor
          ================================================= */}

          <section className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">

            {/* Tabs */}

            <div className="flex h-12 items-center border-b border-[#E5E7EB] px-4">

              <button
                type="button"
                onClick={() =>
                  setShowPreview(false)
                }
                className={`
                  relative
                  h-full
                  px-4
                  text-sm
                  font-medium
                  ${
                    !showPreview
                      ? "text-[#FF5A00]"
                      : "text-[#374151]"
                  }
                `}
              >
                Yozish

                {!showPreview && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF5A00]" />
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowPreview(true)
                }
                className={`
                  relative
                  h-full
                  px-4
                  text-sm
                  font-medium
                  ${
                    showPreview
                      ? "text-[#FF5A00]"
                      : "text-[#374151]"
                  }
                `}
              >
                Oldindan ko‘rish

                {showPreview && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF5A00]" />
                )}
              </button>

            </div>

            {/* Content */}

            {showPreview ? (
              <ArticlePreview
                title={title}
                excerpt={excerpt}
                content={content}
                cover={
                  coverPreviewUrl
                }
              />
            ) : (
              <div className="px-14 py-8">

                {/* Title */}

                <textarea
                  ref={titleRef}
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                  placeholder="Sarlavha yozing..."
                  rows={1}
                  maxLength={180}
                  className="
                    mb-3
                    w-full
                    resize-none
                    overflow-hidden
                    bg-transparent
                    text-[38px]
                    font-bold
                    leading-[1.15]
                    tracking-[-0.03em]
                    text-[#141414]
                    placeholder:text-[#B7BBC0]
                    outline-none
                  "
                />

                {/* Excerpt */}

                <textarea
                  ref={excerptRef}
                  value={excerpt}
                  onChange={(event) =>
                    setExcerpt(
                      event.target.value,
                    )
                  }
                  placeholder="Kiruvchi matn (qisqacha tavsif) yozing..."
                  rows={1}
                  maxLength={160}
                  className="
                    mb-7
                    w-full
                    resize-none
                    overflow-hidden
                    bg-transparent
                    text-[16px]
                    leading-7
                    text-[#6B7280]
                    placeholder:text-[#9CA3AF]
                    outline-none
                  "
                />

                <div className="mb-7 h-px bg-[#E8E3DD]" />

                {/* Tiptap */}

                <InklyEditorV2
                  content={content}
                  onChange={setContent}
                  token={token}
                  placeholder="O'z hikoyangizni yozing..."
                />

              </div>
            )}

            {/* Footer */}

            <div className="mx-4 flex items-center justify-between border-t border-[#E5E7EB] px-4 py-4 text-xs text-[#6B7280]">

              <div className="flex items-center gap-4">

                <span>
                  So‘zlar:{" "}
                  {wordCount}
                </span>

                <span className="h-3 w-px bg-[#D1D5DB]" />

                <span>
                  Belgilar:{" "}
                  {characterCount}
                </span>

                <span className="h-3 w-px bg-[#D1D5DB]" />

                <span>
                  Taxminiy o‘qish vaqti:{" "}
                  {readingTime} daqiqa
                </span>

              </div>

              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-[#141414]"
              >
                <CircleHelp
                  size={13}
                />

                Markdown qo‘llanmasi
              </button>

            </div>

          </section>

          {/* =================================================
              Sidebar
          ================================================= */}

          <aside className="rounded-xl border border-[#E5E7EB] bg-white">

            <div className="sticky top-5">

              {/* ===========================================
                  Publish
              =========================================== */}

              <section className="p-5">

                <h2 className="mb-4 text-sm font-bold text-[#141414]">
                  Nashr qilish
                </h2>

                <Button
                  type="button"
                  onClick={
                    handlePublish
                  }
                  disabled={
                    publishing ||
                    uploadingCover ||
                    !title.trim() ||
                    !content.trim()
                  }
                  className="
                    mb-2
                    h-10
                    w-full
                    rounded-lg
                    bg-[#FF5A00]
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-[#E85000]
                  "
                >
                  {publishing ? (
                    <>
                      <Loader2
                        size={14}
                        className="mr-2 animate-spin"
                      />

                      Nashr qilinmoqda...
                    </>
                  ) : (
                    <>
                      <span>
                        Nashr qilish
                      </span>

                      <Send
                        size={14}
                        className="ml-auto"
                      />
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    handleSaveDraft
                  }
                  disabled={
                    saveStatus ===
                      "saving" ||
                    !title.trim()
                  }
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border-[#E5E7EB]
                    bg-white
                    text-sm
                  "
                >
                  Qoralama saqlash
                </Button>

              </section>

              <Divider />

              {/* ===========================================
                  Status
              =========================================== */}

              <section className="p-5">

                <h3 className="mb-4 text-sm font-semibold text-[#141414]">
                  Holat
                </h3>

                <div className="space-y-4">

                  <StatusRadio
                    checked={
                      publicationState ===
                      "draft"
                    }
                    title="Qoralama"
                    description="Faqat siz ko‘rasiz"
                    onClick={() =>
                      handlePublicationState(
                        "draft",
                      )
                    }
                  />

                  <StatusRadio
                    checked={
                      publicationState ===
                      "ready"
                    }
                    title="Nashrga tayyor"
                    description="Ko‘rib chiqish uchun"
                    onClick={() =>
                      handlePublicationState(
                        "ready",
                      )
                    }
                  />

                  <StatusRadio
                    checked={
                      publicationState ===
                      "published"
                    }
                    title="Nashr etilgan"
                    description="Barchaga ochiq"
                    onClick={() =>
                      handlePublicationState(
                        "published",
                      )
                    }
                  />

                </div>

              </section>

              <Divider />

              {/* ===========================================
                  Content
              =========================================== */}

              <section className="p-5">

                <h3 className="mb-4 text-sm font-semibold text-[#141414]">
                  Kontent
                </h3>

                {/* Categories */}

                <div className="mb-4">

                  <label className="mb-2 block text-xs font-semibold text-[#24292E]">
                    Kategoriyalar
                  </label>

                  <CategorySelect
                    categories={
                      categories
                    }
                    selectedCategories={
                      selectedCategories
                    }
                    selectedNames={
                      selectedCategoryNames
                    }
                    onToggle={
                      toggleCategory
                    }
                  />

                </div>

                {/* Tags */}

                <div className="mb-4">

                  <label className="mb-2 block text-xs font-semibold text-[#24292E]">
                    Teglar
                  </label>

                  <div className="rounded-lg border border-[#E5E7EB] bg-white px-2 py-1.5 focus-within:border-[#FF5A00]">

                    {tags.length > 0 && (
                      <div className="mb-1.5 flex flex-wrap gap-1.5">

                        {tags.map(
                          (tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-md bg-[#FFF3E8] px-2 py-1 text-[10px] font-medium text-[#FF5A00]"
                            >
                              #{tag}

                              <button
                                type="button"
                                onClick={() =>
                                  removeTag(
                                    tag,
                                  )
                                }
                                className="hover:text-[#D94600]"
                              >
                                <X
                                  size={11}
                                />
                              </button>
                            </span>
                          ),
                        )}

                      </div>
                    )}

                    <input
                      value={
                        tagInput
                      }
                      onChange={(
                        event,
                      ) =>
                        setTagInput(
                          event
                            .target
                            .value,
                        )
                      }
                      onKeyDown={
                        handleTagKeyDown
                      }
                      placeholder="Teg qo‘shish..."
                      className="
                        h-7
                        w-full
                        bg-transparent
                        px-1
                        text-xs
                        outline-none
                        placeholder:text-[#9CA3AF]
                      "
                    />

                  </div>

                  <p className="mt-1.5 text-[10px] text-[#6B7280]">
                    Enter bosib teg qo‘shing
                  </p>

                </div>

                {/* Excerpt */}

                <div className="mb-4">

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-xs font-semibold text-[#24292E]">
                      Qisqacha tavsif
                    </label>

                    <span className="text-[10px] text-[#9CA3AF]">
                      {excerpt.length}/160
                    </span>

                  </div>

                  <textarea
                    value={
                      excerpt
                    }
                    onChange={(
                      event,
                    ) =>
                      setExcerpt(
                        event
                          .target
                          .value,
                      )
                    }
                    maxLength={160}
                    rows={3}
                    placeholder="Maqolaga qisqacha tavsif yozing..."
                    className="
                      w-full
                      resize-none
                      rounded-lg
                      border
                      border-[#E5E7EB]
                      px-3
                      py-2.5
                      text-xs
                      leading-5
                      outline-none
                      focus:border-[#FF5A00]
                    "
                  />

                </div>

                {/* Cover */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-[#24292E]">
                    Asosiy rasm
                  </label>

                  {coverPreviewUrl ? (
                    <div className="group relative overflow-hidden rounded-lg border border-[#E5E7EB]">

                      <img
                        src={
                          coverPreviewUrl
                        }
                        alt="Cover"
                        className="aspect-[1.91/1] w-full object-cover"
                      />

                      <div className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        gap-2
                        bg-black/40
                        opacity-0
                        transition
                        group-hover:opacity-100
                      ">

                        <button
                          type="button"
                          onClick={() =>
                            coverInputRef.current?.click()
                          }
                          className="
                            rounded-md
                            bg-white
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                          "
                        >
                          Almashtirish
                        </button>

                        <button
                          type="button"
                          onClick={
                            removeCover
                          }
                          className="
                            rounded-md
                            bg-white
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-red-500
                          "
                        >
                          O‘chirish
                        </button>

                      </div>

                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        coverInputRef.current?.click()
                      }
                      disabled={
                        uploadingCover
                      }
                      className="
                        flex
                        h-[78px]
                        w-full
                        flex-col
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-dashed
                        border-[#C9CDD2]
                        bg-[#FAFAFA]
                        text-[#6B7280]
                        hover:border-[#FF5A00]
                        hover:bg-[#FFF8F4]
                      "
                    >
                      {uploadingCover ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <>
                          <ImageIcon
                            size={19}
                          />

                          <span className="mt-1 text-xs">
                            Rasm yuklash
                          </span>

                          <span className="text-[9px]">
                            JPG, PNG yoki WebP ·
                            Maks. 5MB
                          </span>
                        </>
                      )}
                    </button>
                  )}

                  <input
                    ref={
                      coverInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleCoverUpload
                    }
                    className="hidden"
                  />

                </div>

              </section>

              <Divider />

              {/* ===========================================
                  Additional
              =========================================== */}

              <section className="p-5">

                <h3 className="mb-4 text-sm font-semibold text-[#141414]">
                  Qo‘shimcha
                </h3>

                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#24292E]">

                  <input
                    type="checkbox"
                    checked={
                      allowComments
                    }
                    onChange={(event) =>
                      setAllowComments(
                        event.target
                          .checked,
                      )
                    }
                    className="h-4 w-4 accent-[#FF5A00]"
                  />

                  <span>
                    Izohlarga ruxsat berish
                  </span>

                </label>

              </section>

            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}

/* =========================================================
   Divider
========================================================= */

function Divider() {
  return (
    <div className="mx-5 h-px bg-[#E8E3DD]" />
  )
}

/* =========================================================
   Status Radio
========================================================= */

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
        className={`
          mt-0.5
          flex
          h-[14px]
          w-[14px]
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          ${
            checked
              ? "border-[#FF5A00]"
              : "border-[#7D8389]"
          }
        `}
      >
        {checked && (
          <span className="h-[6px] w-[6px] rounded-full bg-[#FF5A00]" />
        )}
      </span>

      <span className="min-w-0">

        <span
          className={`
            block
            text-[11px]
            font-semibold
            ${
              checked
                ? "text-[#24292E]"
                : "text-[#34393E]"
            }
          `}
        >
          {title}
        </span>

        <span className="mt-0.5 block text-[9px] leading-4 text-[#7C8288]">
          {description}
        </span>

      </span>
    </button>
  )
}

/* =========================================================
   Category Select
========================================================= */

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
  const [open, setOpen] =
    useState(false)

  return (
    <div className="relative">

      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) => !value,
          )
        }
        className="
          flex
          h-9
          w-full
          items-center
          justify-between
          rounded-lg
          border
          border-[#E5E7EB]
          bg-white
          px-3
          text-left
          text-xs
          text-[#6B7280]
          outline-none
          hover:border-[#D1D5DB]
        "
      >
        <span className="truncate">
          {selectedNames.length
            ? selectedNames.join(
                ", ",
              )
            : "Kategoriyani tanlang"}
        </span>

        <ChevronDown
          size={14}
          className={`
            shrink-0
            transition
            ${
              open
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {open && (
        <div className="
          absolute
          left-0
          right-0
          top-10
          z-50
          max-h-56
          overflow-y-auto
          rounded-lg
          border
          border-[#E5E7EB]
          bg-white
          p-1
          shadow-xl
        ">

          {categories.length === 0 ? (
            <div className="px-3 py-3 text-xs text-[#9CA3AF]">
              Kategoriyalar topilmadi
            </div>
          ) : (
            categories.map(
              (category) => {
                const selected =
                  selectedCategories.includes(
                    category.uuid,
                  )

                return (
                  <button
                    key={
                      category.uuid
                    }
                    type="button"
                    onClick={() =>
                      onToggle(
                        category.uuid,
                      )
                    }
                    className="
                      flex
                      w-full
                      items-center
                      gap-2
                      rounded-md
                      px-2.5
                      py-2
                      text-left
                      text-xs
                      hover:bg-[#FFF8F4]
                    "
                  >
                    <span
                      className={`
                        flex
                        h-4
                        w-4
                        items-center
                        justify-center
                        rounded
                        border
                        ${
                          selected
                            ? "border-[#FF5A00] bg-[#FF5A00] text-white"
                            : "border-[#D1D5DB]"
                        }
                      `}
                    >
                      {selected && (
                        <Check
                          size={11}
                        />
                      )}
                    </span>

                    <span className="truncate">
                      {
                        category.name
                      }
                    </span>
                  </button>
                )
              },
            )
          )}

        </div>
      )}

    </div>
  )
}

/* =========================================================
   Article Preview
========================================================= */

function ArticlePreview({
  title,
  excerpt,
  content,
  cover,
}: {
  title: string
  excerpt: string
  content: string
  cover: string
}) {
  return (
    <article className="min-h-[700px] px-14 py-10">

      {cover && (
        <img
          src={cover}
          alt=""
          className="
            mb-8
            aspect-[1.91/1]
            w-full
            rounded-xl
            object-cover
          "
        />
      )}

      <h1 className="
        text-[38px]
        font-bold
        leading-tight
        tracking-[-0.03em]
        text-[#161B20]
      ">
        {title ||
          "Sarlavha yozing..."}
      </h1>

      {excerpt && (
        <p className="
          mt-4
          text-[17px]
          leading-7
          text-[#70767C]
        ">
          {excerpt}
        </p>
      )}

      <div className="my-8 h-px bg-[#E8E9EB]" />

      <div
        className="
          prose
          prose-neutral
          max-w-none
        "
        dangerouslySetInnerHTML={{
          __html:
            content ||
            "<p>Maqola matni shu yerda ko‘rinadi...</p>",
        }}
      />

    </article>
  )
}