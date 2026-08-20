"use client"

import {
  EditorContent,
  useEditor,
} from "@tiptap/react"

import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import LinkExt from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"

import {
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  List,
  ListOrdered,
  Minus,
  Code2,
  Undo2,
  Redo2,
  ChevronDown,
  Maximize2,
  Minimize2,
  Code,
  Loader2,
} from "lucide-react"

import {
  useEffect,
  useRef,
  useState,
} from "react"

import { toast } from "sonner"

import { uploadsApi } from "@/lib/api/uploads"

interface InklyEditorProps {
  content: string
  onChange: (content: string) => void
  token?: string | null
  placeholder?: string
}

/* =========================================================
   Toolbar Button
========================================================= */

function ToolbarButton({
  active = false,
  disabled = false,
  onClick,
  title,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault()
      }}
      onClick={onClick}
      className={[
        "flex h-8 w-8 shrink-0 items-center justify-center",
        "rounded-md transition-all",
        "text-[#30363B]",
        "hover:bg-[#F4F5F6]",
        "hover:text-[#141414]",
        "disabled:pointer-events-none",
        "disabled:opacity-35",
        active
          ? "bg-[#FFF3E8] text-[#FF6A00]"
          : "",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

/* =========================================================
   Toolbar Divider
========================================================= */

function ToolbarDivider() {
  return (
    <div className="mx-1 h-5 w-px shrink-0 bg-[#E5E7EB]" />
  )
}

/* =========================================================
   Inkly Editor
========================================================= */

export function InklyEditorV2({
  content,
  onChange,
  token,
  placeholder,
}: InklyEditorProps) {
  const [uploadingImage, setUploadingImage] =
    useState(false)

  const [fullscreen, setFullscreen] =
    useState(false)

  const [showHeadingMenu, setShowHeadingMenu] =
    useState(false)

  const [showMarkdownMenu, setShowMarkdownMenu] =
    useState(false)

  const fileInputRef =
    useRef<HTMLInputElement>(null)

  const editorWrapperRef =
    useRef<HTMLDivElement>(null)

  /* =========================================================
     Editor
  ========================================================= */

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      /* -------------------------------------------------------
         Starter Kit
      ------------------------------------------------------- */

      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },

        codeBlock: {
          HTMLAttributes: {
            class:
              "not-prose rounded-xl bg-[#171717] px-5 py-4 text-sm text-[#e5e7eb] font-mono overflow-x-auto my-6",
          },
        },
      }),

      /* -------------------------------------------------------
         Placeholder
      ------------------------------------------------------- */

      Placeholder.configure({
        placeholder:
          placeholder ??
          "O'z hikoyangizni yozing...",

        emptyEditorClass:
          "is-editor-empty",
      }),

      /* -------------------------------------------------------
         Link
      ------------------------------------------------------- */

      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,

        HTMLAttributes: {
          class:
            "text-[#FF6A00] underline underline-offset-4 cursor-pointer",

          rel:
            "noopener noreferrer nofollow",

          target: "_blank",
        },
      }),

      /* -------------------------------------------------------
         Image
      ------------------------------------------------------- */

      Image.configure({
        inline: false,
        allowBase64: false,

        HTMLAttributes: {
          class:
            "inkly-editor-image rounded-xl w-full object-cover my-8",
        },
      }),
    ],

    /* ---------------------------------------------------------
       Initial content
    --------------------------------------------------------- */

    content,

    /* ---------------------------------------------------------
       Editor props
    --------------------------------------------------------- */

    editorProps: {
      attributes: {
        class:
          "inkly-editor-content max-w-none min-h-[560px] focus:outline-none",
      },

      /* -------------------------------------------------------
         Paste image
      ------------------------------------------------------- */

      handlePaste: (_view, event) => {
        const items = Array.from(
          event.clipboardData?.items ?? [],
        )

        const imageItem = items.find(
          (item) =>
            item.type.startsWith("image/"),
        )

        if (!imageItem) {
          return false
        }

        const file =
          imageItem.getAsFile()

        if (!file) {
          return false
        }

        uploadImage(file)

        return true
      },

      /* -------------------------------------------------------
         Drag & Drop image
      ------------------------------------------------------- */

      handleDrop: (
        _view,
        event,
      ) => {
        const files =
          Array.from(
            event.dataTransfer?.files ?? [],
          )

        const image =
          files.find(
            (file) =>
              file.type.startsWith(
                "image/",
              ),
          )

        if (!image) {
          return false
        }

        uploadImage(image)

        return true
      },
    },

    /* ---------------------------------------------------------
       Update
    --------------------------------------------------------- */

    onUpdate: ({ editor }) => {
      onChange(
        editor.getHTML(),
      )
    },
  })

  /* =========================================================
     External Content Sync
  ========================================================= */

  useEffect(() => {
    if (!editor) {
      return
    }

    const currentHTML =
      editor.getHTML()

    /*
     * Tashqaridan yangi content kelsa
     * editor ichiga yozamiz.
     */

    if (
      content &&
      content !== currentHTML
    ) {
      editor.commands.setContent(content, false)
    }

    /*
     * Content bo'sh bo'lsa editorni
     * tozalaymiz.
     */

    if (
      !content &&
      currentHTML !== "<p></p>"
    ) {
      editor.commands.clearContent()
    }
  }, [
    content,
    editor,
  ])

  /* =========================================================
     Close menus
  ========================================================= */

  useEffect(() => {
    const handleClick = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as HTMLElement

      if (
        !target.closest(
          "[data-heading-menu]",
        )
      ) {
        setShowHeadingMenu(false)
      }

      if (
        !target.closest(
          "[data-markdown-menu]",
        )
      ) {
        setShowMarkdownMenu(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handleClick,
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClick,
      )
    }
  }, [])

  /* =========================================================
     Fullscreen listener
  ========================================================= */

  useEffect(() => {
    const handleFullscreen =
      () => {
        setFullscreen(
          Boolean(
            document.fullscreenElement,
          ),
        )
      }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen,
    )

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen,
      )
    }
  }, [])

  /* =========================================================
     Editor loading
  ========================================================= */

  if (!editor) {
    return (
      <div className="flex min-h-[560px] items-center justify-center">
        <Loader2
          size={22}
          className="animate-spin text-[#FF6A00]"
        />
      </div>
    )
  }

  /* =========================================================
     Image Upload
  ========================================================= */

  async function uploadImage(
    file: File,
  ) {
    if (!token) {
      toast.error("Rasm yuklash uchun tizimga kirishingiz kerak.")
      return
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      return
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error("Rasm hajmi 5MB dan oshmasligi kerak.")
      return
    }

    if (!editor) return
    setUploadingImage(true)

    try {
      const upload =
        await uploadsApi.postImage(
          token,
          file,
        )

      editor
        .chain()
        .focus()
        .setImage({
          src: upload.url,
        })
        .run()
    } catch (error) {
      console.error(
        "Image upload error:",
        error,
      )

      toast.error(
        error instanceof Error
          ? error.message
          : "Rasm yuklashda xatolik yuz berdi.",
      )
    } finally {
      setUploadingImage(false)
    }
  }

  /* =========================================================
     Open Image Picker
  ========================================================= */

  function openImagePicker() {
    if (uploadingImage) {
      return
    }

    fileInputRef.current?.click()
  }

  /* =========================================================
     Link
  ========================================================= */

  function setLink() {
    if (!editor) return
    const previousUrl =
      editor.getAttributes(
        "link",
      ).href ?? ""

    const url =
      window.prompt(
        "Havola URL manzilini kiriting:",
        previousUrl,
      )

    if (url === null) {
      return
    }

    const trimmedUrl =
      url.trim()

    /*
     * URL bo'sh bo'lsa linkni olib tashlaymiz.
     */

    if (!trimmedUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange(
          "link",
        )
        .unsetLink()
        .run()

      return
    }

    /*
     * Agar protocol yozilmagan bo'lsa,
     * https:// qo'shamiz.
     */

    const normalizedUrl =
      /^https?:\/\//i.test(
        trimmedUrl,
      )
        ? trimmedUrl
        : `https://${trimmedUrl}`

    editor
      .chain()
      .focus()
      .extendMarkRange(
        "link",
      )
      .setLink({
        href: normalizedUrl,
      })
      .run()
  }

  /* =========================================================
     Heading
  ========================================================= */

  function setHeading(
    level: 2 | 3 | 4,
  ) {
    if (!editor) return
    editor
      .chain()
      .focus()
      .toggleHeading({
        level,
      })
      .run()

    setShowHeadingMenu(false)
  }

  const currentHeading =
    editor.isActive(
      "heading",
      {
        level: 2,
      },
    )
      ? "H2"
      : editor.isActive(
        "heading",
        {
          level: 3,
        },
      )
        ? "H3"
        : editor.isActive(
          "heading",
          {
            level: 4,
          },
        )
          ? "H4"
          : "¶"

  /* =========================================================
     Fullscreen
  ========================================================= */

  async function toggleFullscreen() {
    if (!editorWrapperRef.current) {
      return
    }

    try {
      if (
        !document.fullscreenElement
      ) {
        await editorWrapperRef.current.requestFullscreen()

        setFullscreen(true)
      } else {
        await document.exitFullscreen()

        setFullscreen(false)
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error,
      )
    }
  }

  /* =========================================================
     Word Count
  ========================================================= */

  const text =
    editor.getText()

  const trimmedText =
    text.trim()

  const wordCount =
    trimmedText
      ? trimmedText
        .split(/\s+/)
        .filter(Boolean)
        .length
      : 0

  const characterCount =
    text.length

  const readingTime =
    Math.max(
      1,
      Math.ceil(
        wordCount / 200,
      ),
    )

  /* =========================================================
     Render
  ========================================================= */

  return (
    <div
      ref={editorWrapperRef}
      className={[
        "relative",
        "flex min-h-0 flex-col",
        fullscreen
          ? "h-screen overflow-hidden bg-white"
          : "",
      ].join(" ")}
    >
      {/* =====================================================
          Hidden Image Input
      ===================================================== */}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file =
            event.target.files?.[0]

          /*
           * Bir xil rasmni qayta tanlash
           * imkoniyati uchun reset qilamiz.
           */

          event.target.value = ""

          if (file) {
            uploadImage(file)
          }
        }}
      />

      {/* =====================================================
          Upload Indicator
      ===================================================== */}

      {uploadingImage && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 rounded-xl border border-[#E8E3DD] bg-white px-4 py-3 text-sm shadow-xl">
          <Loader2
            size={15}
            className="animate-spin text-[#FF6A00]"
          />

          <span>
            Rasm yuklanmoqda...
          </span>
        </div>
      )}

      {/* =====================================================
          MAIN TOOLBAR
      ===================================================== */}

      <div className="sticky top-0 z-30 flex h-[48px] shrink-0 items-center border-b border-[#E5E7EB] bg-white px-4">
        <div className="flex w-full items-center gap-0.5 overflow-x-auto scrollbar-none">

          {/* =================================================
              HEADING
          ================================================= */}

          <div
            className="relative shrink-0"
            data-heading-menu
          >
            <button
              type="button"
              title="Sarlavha"
              onMouseDown={(event) =>
                event.preventDefault()
              }
              onClick={() =>
                setShowHeadingMenu(
                  (value) => !value,
                )
              }
              className={[
                "flex h-8 items-center gap-1 rounded-md px-2",
                "text-xs font-medium",
                "text-[#30363B]",
                "hover:bg-[#F4F5F6]",
                "hover:text-[#141414]",
              ].join(" ")}
            >
              <span className="min-w-[20px] text-left font-semibold">
                {currentHeading}
              </span>

              <ChevronDown
                size={13}
              />
            </button>

            {showHeadingMenu && (
              <div
                data-heading-menu
                className="absolute left-0 top-10 z-50 w-36 rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-xl"
              >
                {/* H2 */}

                <button
                  type="button"
                  onMouseDown={(
                    event,
                  ) =>
                    event.preventDefault()
                  }
                  onClick={() =>
                    setHeading(2)
                  }
                  className={[
                    "flex w-full items-center rounded-lg px-3 py-2 text-left",
                    "hover:bg-[#F5F5F5]",
                    editor.isActive(
                      "heading",
                      {
                        level: 2,
                      },
                    )
                      ? "bg-[#FFF3E8] text-[#FF6A00]"
                      : "text-[#30363B]",
                  ].join(" ")}
                >
                  <span className="text-base font-bold">
                    H2
                  </span>
                </button>

                {/* H3 */}

                <button
                  type="button"
                  onMouseDown={(
                    event,
                  ) =>
                    event.preventDefault()
                  }
                  onClick={() =>
                    setHeading(3)
                  }
                  className={[
                    "flex w-full items-center rounded-lg px-3 py-2 text-left",
                    "hover:bg-[#F5F5F5]",
                    editor.isActive(
                      "heading",
                      {
                        level: 3,
                      },
                    )
                      ? "bg-[#FFF3E8] text-[#FF6A00]"
                      : "text-[#30363B]",
                  ].join(" ")}
                >
                  <span className="text-sm font-bold">
                    H3
                  </span>
                </button>

                {/* H4 */}

                <button
                  type="button"
                  onMouseDown={(
                    event,
                  ) =>
                    event.preventDefault()
                  }
                  onClick={() =>
                    setHeading(4)
                  }
                  className={[
                    "flex w-full items-center rounded-lg px-3 py-2 text-left",
                    "hover:bg-[#F5F5F5]",
                    editor.isActive(
                      "heading",
                      {
                        level: 4,
                      },
                    )
                      ? "bg-[#FFF3E8] text-[#FF6A00]"
                      : "text-[#30363B]",
                  ].join(" ")}
                >
                  <span className="text-xs font-semibold">
                    H4
                  </span>
                </button>

                <div className="my-1 h-px bg-[#E5E7EB]" />

                {/* Paragraph */}

                <button
                  type="button"
                  onMouseDown={(
                    event,
                  ) =>
                    event.preventDefault()
                  }
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .setParagraph()
                      .run()

                    setShowHeadingMenu(
                      false,
                    )
                  }}
                  className={[
                    "w-full rounded-lg px-3 py-2 text-left text-xs",
                    "text-[#30363B]",
                    "hover:bg-[#F5F5F5]",
                  ].join(" ")}
                >
                  Oddiy matn
                </button>
              </div>
            )}
          </div>

          <ToolbarDivider />

          {/* =================================================
              BOLD
          ================================================= */}

          <ToolbarButton
            active={editor.isActive(
              "bold",
            )}
            title="Qalin — Ctrl+B"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
          >
            <Bold size={16} />
          </ToolbarButton>

          {/* =================================================
              ITALIC
          ================================================= */}

          <ToolbarButton
            active={editor.isActive(
              "italic",
            )}
            title="Qiya — Ctrl+I"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
          >
            <Italic size={16} />
          </ToolbarButton>

          {/* =================================================
              STRIKE
          ================================================= */}

          <ToolbarButton
            active={editor.isActive(
              "strike",
            )}
            title="Ustidan chiziq"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleStrike()
                .run()
            }
          >
            <Strikethrough
              size={16}
            />
          </ToolbarButton>

          {/* =================================================
              INLINE CODE
          ================================================= */}

          <ToolbarButton
            active={editor.isActive(
              "code",
            )}
            title="Inline kod"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleCode()
                .run()
            }
          >
            <Code size={16} />
          </ToolbarButton>

          {/* =================================================
              LINK
          ================================================= */}

          <ToolbarButton
            active={editor.isActive(
              "link",
            )}
            title="Havola"
            onClick={setLink}
          >
            <LinkIcon size={16} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* =================================================
              IMAGE
          ================================================= */}

          <ToolbarButton
            title={
              uploadingImage
                ? "Rasm yuklanmoqda..."
                : "Rasm qo‘shish"
            }
            disabled={
              uploadingImage
            }
            onClick={
              openImagePicker
            }
          >
            {uploadingImage ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <ImageIcon
                size={17}
              />
            )}
          </ToolbarButton>

          {/* =================================================
              BLOCKQUOTE
          ================================================= */}

          <ToolbarButton
            active={editor.isActive(
              "blockquote",
            )}
            title="Iqtibos"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBlockquote()
                .run()
            }
          >
            <Quote size={17} />
          </ToolbarButton>

          {/* =================================================
              BULLET LIST
          ================================================= */}

          <ToolbarButton
            active={editor.isActive(
              "bulletList",
            )}
            title="Belgili ro‘yxat"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBulletList()
                .run()
            }
          >
            <List size={17} />
          </ToolbarButton>

          {/* =================================================
              ORDERED LIST
          ================================================= */}

          <ToolbarButton
            active={editor.isActive(
              "orderedList",
            )}
            title="Raqamli ro‘yxat"
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
          >
            <ListOrdered
              size={17}
            />
          </ToolbarButton>

          {/* =================================================
              HORIZONTAL RULE
          ================================================= */}

          <ToolbarButton
            title="Ajratgich"
            onClick={() =>
              editor
                .chain()
                .focus()
                .setHorizontalRule()
                .run()
            }
          >
            <Minus size={18} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* =================================================
              UNDO
          ================================================= */}

          <ToolbarButton
            title="Bekor qilish — Ctrl+Z"
            disabled={
              !editor.can().undo()
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .undo()
                .run()
            }
          >
            <Undo2 size={16} />
          </ToolbarButton>

          {/* =================================================
              REDO
          ================================================= */}

          <ToolbarButton
            title="Qayta qilish — Ctrl+Y"
            disabled={
              !editor.can().redo()
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .redo()
                .run()
            }
          >
            <Redo2 size={16} />
          </ToolbarButton>

          {/* =================================================
              SPACER
          ================================================= */}

          <div className="min-w-2 flex-1" />

          {/* =================================================
              MARKDOWN MENU
          ================================================= */}

          <div
            className="relative shrink-0"
            data-markdown-menu
          >
            <button
              type="button"
              title="Markdown"
              onMouseDown={(event) =>
                event.preventDefault()
              }
              onClick={() =>
                setShowMarkdownMenu(
                  (value) => !value,
                )
              }
              className={[
                "flex h-8 items-center gap-1 rounded-md px-2",
                "text-xs font-medium",
                "text-[#30363B]",
                "hover:bg-[#F4F5F6]",
                "hover:text-[#141414]",
              ].join(" ")}
            >
              Markdown

              <ChevronDown
                size={13}
              />
            </button>

            {showMarkdownMenu && (
              <div
                data-markdown-menu
                className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-xl"
              >
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                  Format
                </div>

                {/* Inline Code */}

                <button
                  type="button"
                  onMouseDown={(
                    event,
                  ) =>
                    event.preventDefault()
                  }
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .toggleCode()
                      .run()

                    setShowMarkdownMenu(
                      false,
                    )
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-[#30363B] hover:bg-[#F5F5F5]"
                >
                  <Code2
                    size={14}
                  />

                  Inline code
                </button>

                {/* Code Block */}

                <button
                  type="button"
                  onMouseDown={(
                    event,
                  ) =>
                    event.preventDefault()
                  }
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .toggleCodeBlock()
                      .run()

                    setShowMarkdownMenu(
                      false,
                    )
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-[#30363B] hover:bg-[#F5F5F5]"
                >
                  <Code
                    size={14}
                  />

                  Code block
                </button>

                <div className="my-1 h-px bg-[#E5E7EB]" />

                <div className="px-2 py-1 text-[10px] leading-4 text-[#9CA3AF]">
                  Markdown formatlash
                  Tiptap tomonidan
                  HTML sifatida
                  saqlanadi.
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              FULLSCREEN
          ================================================= */}

          <ToolbarButton
            title={
              fullscreen
                ? "Oddiy ko‘rinish"
                : "To‘liq ekran"
            }
            onClick={
              toggleFullscreen
            }
          >
            {fullscreen ? (
              <Minimize2
                size={16}
              />
            ) : (
              <Maximize2
                size={16}
              />
            )}
          </ToolbarButton>
        </div>
      </div>

      {/* =====================================================
          EDITOR CONTENT
      ===================================================== */}

      <div
        className={[
          "flex-1 px-14 py-8",
          fullscreen
            ? "mx-auto w-full max-w-[1000px] overflow-y-auto"
            : "",
        ].join(" ")}
      >
        <EditorContent
          editor={editor}
        />
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="mx-4 flex shrink-0 items-center justify-between border-t border-[#E5E7EB] px-4 py-4 text-xs text-[#6B7280]">
        <div className="flex items-center gap-4">
          {/* Words */}

          <span>
            So‘zlar:{" "}
            {wordCount}
          </span>

          <span className="h-3 w-px bg-[#D1D5DB]" />

          {/* Characters */}

          <span>
            Belgilar:{" "}
            {characterCount}
          </span>

          <span className="h-3 w-px bg-[#D1D5DB]" />

          {/* Reading time */}

          <span>
            Taxminiy o‘qish vaqti:{" "}
            {readingTime}{" "}
            daqiqa
          </span>
        </div>

        <button
          type="button"
          className="text-[#6B7280] transition-colors hover:text-[#141414]"
        >
          Markdown qo‘llanmasi
        </button>
      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx global>{`
        /* =====================================================
           Editor
        ===================================================== */

        .inkly-editor-content {
          font-family:
            Inter,
            "Helvetica Neue",
            Arial,
            sans-serif;

          font-size: 18px;

          line-height: 1.8;

          color: #141414;

          outline: none;
        }

        .inkly-editor-content p {
          margin-bottom: 1.25em;
        }

        /* =====================================================
           Headings
        ===================================================== */

        .inkly-editor-content h2 {
          font-size: 1.65em;

          font-weight: 700;

          line-height: 1.25;

          margin-top: 2em;

          margin-bottom: 0.75em;

          color: #141414;
        }

        .inkly-editor-content h3 {
          font-size: 1.3em;

          font-weight: 650;

          line-height: 1.35;

          margin-top: 1.6em;

          margin-bottom: 0.6em;

          color: #141414;
        }

        .inkly-editor-content h4 {
          font-size: 1.1em;

          font-weight: 650;

          line-height: 1.35;

          margin-top: 1.4em;

          margin-bottom: 0.4em;

          color: #141414;
        }

        /* =====================================================
           Blockquote
        ===================================================== */

        .inkly-editor-content blockquote {
          margin: 1.75rem 0;

          padding: 0.9rem 1.25rem;

          border-left: 3px solid #ff6a00;

          background: #fff9f3;

          border-radius:
            0 12px 12px 0;

          color: #36565f;

          font-style: italic;
        }

        .inkly-editor-content blockquote p:last-child {
          margin-bottom: 0;
        }

        /* =====================================================
           Lists
        ===================================================== */

        .inkly-editor-content ul,
        .inkly-editor-content ol {
          padding-left: 1.5rem;

          margin-bottom: 1.3em;
        }

        .inkly-editor-content li {
          margin-bottom: 0.45em;
        }

        .inkly-editor-content ul {
          list-style-type: disc;
        }

        .inkly-editor-content ol {
          list-style-type: decimal;
        }

        /* =====================================================
           Inline Code
        ===================================================== */

        .inkly-editor-content code {
          background: #f2f4f7;

          border-radius: 5px;

          padding:
            0.15em
            0.4em;

          font-size: 0.88em;

          font-family:
            "JetBrains Mono",
            "Fira Code",
            monospace;

          color: #36565f;
        }

        /* =====================================================
           Code Block
        ===================================================== */

        .inkly-editor-content pre {
          background: #171717;

          color: #f5f5f5;

          border-radius: 14px;

          padding:
            1.25rem
            1.5rem;

          overflow-x: auto;

          margin: 2rem 0;

          font-size: 0.88em;

          line-height: 1.65;
        }

        .inkly-editor-content pre code {
          background: transparent;

          color: inherit;

          padding: 0;

          border-radius: 0;
        }

        /* =====================================================
           Horizontal Rule
        ===================================================== */

        .inkly-editor-content hr {
          border: 0;

          border-top:
            1px solid #e8e3dd;

          margin: 2.5rem 0;
        }

        /* =====================================================
           Images
        ===================================================== */

        .inkly-editor-content img {
          display: block;

          max-width: 100%;

          height: auto;

          margin: 2rem auto;

          border-radius: 14px;

          cursor: default;
        }

        .inkly-editor-content img.ProseMirror-selectednode {
          outline:
            3px solid
            rgba(
              255,
              106,
              0,
              0.25
            );

          outline-offset: 3px;
        }

        /* =====================================================
           Links
        ===================================================== */

        .inkly-editor-content a {
          color: #ff6a00;

          text-decoration: underline;

          text-underline-offset: 4px;
        }

        /* =====================================================
           Strong
        ===================================================== */

        .inkly-editor-content strong {
          color: #141414;

          font-weight: 700;
        }

        /* =====================================================
           Placeholder
        ===================================================== */

        .inkly-editor-content
          .is-editor-empty:first-child::before {
          content: attr(data-placeholder);

          float: left;

          height: 0;

          pointer-events: none;

          color: #c8c8c8;
        }

        /* =====================================================
           Selection
        ===================================================== */

        .inkly-editor-content ::selection {
          background:
            rgba(
              255,
              106,
              0,
              0.16
            );
        }

        /* =====================================================
           Focus
        ===================================================== */

        .inkly-editor-content:focus {
          outline: none;
        }

        /* =====================================================
           Fullscreen
        ===================================================== */

        :fullscreen {
          background: white;
        }

        :fullscreen .inkly-editor-content {
          min-height:
            calc(
              100vh - 120px
            );
        }

        /* =====================================================
           Scrollbar
        ===================================================== */

        .inkly-editor-content::-webkit-scrollbar {
          width: 6px;
        }

        .inkly-editor-content::-webkit-scrollbar-thumb {
          background: #d7dadd;

          border-radius: 10px;
        }

        .inkly-editor-content::-webkit-scrollbar-track {
          background: transparent;
        }

        /* =====================================================
           Toolbar scrollbar
        ===================================================== */

        .scrollbar-none {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }

        /* =====================================================
           Mobile
        ===================================================== */

        @media (max-width: 768px) {
          .inkly-editor-content {
            font-size: 17px;
          }

          .inkly-editor-content h2 {
            font-size: 1.5em;
          }

          .inkly-editor-content h3 {
            font-size: 1.25em;
          }
        }
      `}</style>
    </div>
  )
}
