"use client"

import { useEffect, useRef, useState } from "react"
import {
  Editor,
  EditorContent,
  useEditor,
  BubbleMenu,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react"
import { Node, mergeAttributes } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import LinkExt from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

import {
  Bold,
  Italic,
  Link as LinkIcon,
  Code2,
  Loader2,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Image as ImageIcon,
  Video,
  X,
  ExternalLink,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { uploadsApi } from "@/lib/api/uploads"

/* =========================================================
   Types
========================================================= */

interface InklyEditorProps {
  content: string
  onChange: (content: string) => void
  token?: string | null
  placeholder?: string
}

/* =========================================================
   Video URL helpers
========================================================= */

function parseVideoUrl(url: string): {
  provider: "youtube" | "vimeo" | null
  embedUrl: string | null
} {
  const trimmed = url.trim()

  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of ytPatterns) {
    const match = trimmed.match(pattern)
    if (match) {
      return {
        provider: "youtube",
        embedUrl: `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`,
      }
    }
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?byline=0&portrait=0`,
    }
  }

  return { provider: null, embedUrl: null }
}

/* =========================================================
   Video Node — Tiptap extension
========================================================= */

const VideoNode = Node.create({
  name: "inklyVideo",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      provider: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: "div[data-inkly-video]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-inkly-video": "" }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView)
  },
})

function VideoNodeView({ node }: ReactNodeViewProps) {
  return (
    <NodeViewWrapper>
      <div className="inkly-video-block">
        <div className="inkly-video-ratio">
          <iframe
            src={node.attrs.src}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </NodeViewWrapper>
  )
}

/* =========================================================
   Slash Command Items
========================================================= */

const SLASH_ITEMS = [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: <Heading1 size={18} />,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 size={18} />,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: <Heading3 size={18} />,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "Quote",
    description: "Blockquote",
    icon: <Quote size={18} />,
    command: (editor: Editor) =>
      editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Bullet list",
    description: "Unordered list",
    icon: <List size={18} />,
    command: (editor: Editor) =>
      editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    description: "Ordered list",
    icon: <ListOrdered size={18} />,
    command: (editor: Editor) =>
      editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Code block",
    description: "Monospace code",
    icon: <Code2 size={18} />,
    command: (editor: Editor) =>
      editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Image",
    description: "Upload an image",
    icon: <ImageIcon size={18} />,
    command: (_editor: Editor, triggerImage?: () => void) => {
      triggerImage?.()
    },
  },
  {
    title: "Video",
    description: "YouTube or Vimeo",
    icon: <Video size={18} />,
    command: (
      _editor: Editor,
      _triggerImage?: () => void,
      triggerVideo?: () => void
    ) => {
      triggerVideo?.()
    },
  },
]

/* =========================================================
   Slash Command Menu
========================================================= */

function SlashCommandMenu({
  items,
  selectedIndex,
  onSelect,
}: {
  items: typeof SLASH_ITEMS
  selectedIndex: number
  onSelect: (item: (typeof SLASH_ITEMS)[0]) => void
}) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  if (items.length === 0) return null

  return (
    <div className="inkly-slash-menu">
      {items.map((item, index) => (
        <button
          key={item.title}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(item)
          }}
          className={`inkly-slash-item ${index === selectedIndex ? "inkly-slash-item--active" : ""}`}
        >
          <span className="inkly-slash-icon">{item.icon}</span>
          <span className="inkly-slash-text">
            <span className="inkly-slash-title">{item.title}</span>
            <span className="inkly-slash-desc">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

/* =========================================================
   Slash Command Extension
========================================================= */

interface SlashCommandState {
  active: boolean
  query: string
  range: { from: number; to: number }
}

function createSlashExtension(
  onUpdate: (state: SlashCommandState) => void,
  onClose: () => void
) {
  return Extension.create({
    name: "slashCommand",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey("slashCommand"),
          view() {
            return {
              update(view) {
                const { state } = view
                const { selection } = state
                const { $from } = selection

                const textBefore = $from.parent.textContent.slice(
                  0,
                  $from.parentOffset
                )
                const slashIndex = textBefore.lastIndexOf("/")

                if (slashIndex === -1) {
                  onClose()
                  return
                }

                const charBeforeSlash = textBefore[slashIndex - 1]
                if (
                  charBeforeSlash &&
                  charBeforeSlash !== " " &&
                  charBeforeSlash !== "\n"
                ) {
                  onClose()
                  return
                }

                const query = textBefore.slice(slashIndex + 1)
                if (query.includes(" ")) {
                  onClose()
                  return
                }

                const from = $from.pos - query.length - 1
                const to = $from.pos

                onUpdate({ active: true, query, range: { from, to } })
              },
            }
          },
        }),
      ]
    },
  })
}

/* =========================================================
   Bubble Menu Button
========================================================= */

function BubbleButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inkly-bubble-btn ${active ? "inkly-bubble-btn--active" : ""}`}
    >
      {children}
    </button>
  )
}

/* =========================================================
   Inline Toolbar Button
========================================================= */

function ToolbarButton({
  active,
  onClick,
  title,
  children,
  disabled,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inkly-toolbar-btn ${active ? "inkly-toolbar-btn--active" : ""}`}
    >
      {children}
    </button>
  )
}

/* =========================================================
   Inline Link Popover
========================================================= */

function LinkPopover({
  onApply,
  onClose,
  initialUrl,
}: {
  onApply: (url: string) => void
  onClose: () => void
  initialUrl: string
}) {
  const [value, setValue] = useState(initialUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const apply = () => {
    const trimmed = value.trim()
    const normalized =
      trimmed && !/^https?:\/\//i.test(trimmed)
        ? `https://${trimmed}`
        : trimmed
    onApply(normalized)
  }

  return (
    <div className="inkly-link-popover">
      <div className="inkly-link-popover-inner">
        <LinkIcon size={13} className="inkly-link-icon" />
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              apply()
            }
            if (e.key === "Escape") {
              e.preventDefault()
              onClose()
            }
          }}
          placeholder="Paste URL..."
          className="inkly-link-input"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={apply}
          className="inkly-link-apply"
          title="Apply"
        >
          <Check size={12} />
        </button>
        {initialUrl && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onApply("")}
            className="inkly-link-remove"
            title="Remove link"
          >
            <X size={12} />
          </button>
        )}
        {initialUrl && (
          <a
            href={initialUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseDown={(e) => e.preventDefault()}
            className="inkly-link-open"
            title="Open link"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  )
}

/* =========================================================
   Video Input Popover
========================================================= */

function VideoInputPopover({
  onInsert,
  onClose,
}: {
  onInsert: (url: string) => void
  onClose: () => void
}) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const insert = () => {
    const trimmed = value.trim()
    if (!trimmed) {
      setError("Please enter a URL")
      return
    }
    const { embedUrl } = parseVideoUrl(trimmed)
    if (!embedUrl) {
      setError("Only YouTube and Vimeo URLs are supported")
      return
    }
    onInsert(trimmed)
  }

  return (
    <div className="inkly-video-popover">
      <div className="inkly-video-popover-header">
        <Video size={15} />
        <span>Insert video</span>
        <button type="button" onClick={onClose} className="inkly-video-close">
          <X size={14} />
        </button>
      </div>
      <input
        ref={inputRef}
        type="url"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setError("")
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            insert()
          }
          if (e.key === "Escape") {
            e.preventDefault()
            onClose()
          }
        }}
        placeholder="https://youtube.com/watch?v=... or vimeo.com/..."
        className="inkly-video-input"
      />
      {error && <p className="inkly-video-error">{error}</p>}
      <div className="inkly-video-actions">
        <button
          type="button"
          onClick={insert}
          className="inkly-video-btn-primary"
        >
          Insert video
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inkly-video-btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

/* =========================================================
   Word Count
========================================================= */

function WordCount({ text }: { text: string }) {
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0
  const chars = text.length
  const readTime = Math.max(1, Math.ceil(words / 200))

  return (
    <div className="inkly-footer">
      <span>{words} words</span>
      <span className="inkly-footer-divider" />
      <span>{chars} chars</span>
      <span className="inkly-footer-divider" />
      <span>~{readTime} min read</span>
    </div>
  )
}

/* =========================================================
   Formatting Toolbar
========================================================= */

function FormattingToolbar({
  editor,
  onLinkClick,
  onImageClick,
  onVideoClick,
}: {
  editor: Editor
  onLinkClick: () => void
  onImageClick: () => void
  onVideoClick: () => void
}) {
  return (
    <div className="inkly-toolbar">
      <div className="inkly-toolbar-group">
        <ToolbarButton
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("link")}
          title="Link"
          onClick={onLinkClick}
        >
          <LinkIcon size={15} />
        </ToolbarButton>
      </div>

      <div className="inkly-toolbar-divider" />

      <div className="inkly-toolbar-group">
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 size={15} />
        </ToolbarButton>
      </div>

      <div className="inkly-toolbar-divider" />

      <div className="inkly-toolbar-group">
        <ToolbarButton
          active={editor.isActive("blockquote")}
          title="Quote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("codeBlock")}
          title="Code block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 size={15} />
        </ToolbarButton>
      </div>

      <div className="inkly-toolbar-divider" />

      <div className="inkly-toolbar-group">
        <ToolbarButton title="Insert image" onClick={onImageClick}>
          <ImageIcon size={15} />
        </ToolbarButton>
        <ToolbarButton title="Insert video" onClick={onVideoClick}>
          <Video size={15} />
        </ToolbarButton>
      </div>
    </div>
  )
}

/* =========================================================
   Main Editor
========================================================= */

export function InklyEditorNovel({
  content,
  onChange,
  token,
  placeholder,
}: InklyEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showLinkPopover, setShowLinkPopover] = useState(false)
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [showToolbarLink, setShowToolbarLink] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const slashRangeRef = useRef<{ from: number; to: number } | null>(null)

  const [slashState, setSlashState] = useState<SlashCommandState>({
    active: false,
    query: "",
    range: { from: 0, to: 0 },
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })

  /* -------------------------------------------------------
     Filtered items
  ------------------------------------------------------- */

  const filteredItems = slashState.query
    ? SLASH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(slashState.query.toLowerCase()) ||
        item.description
          .toLowerCase()
          .includes(slashState.query.toLowerCase())
    )
    : SLASH_ITEMS

  /* -------------------------------------------------------
     Refs for stale closure prevention
  ------------------------------------------------------- */

  const slashUpdateRef = useRef<(state: SlashCommandState) => void>(() => { })
  const slashCloseRef = useRef<() => void>(() => { })
  const slashStateRef = useRef(slashState)
  const filteredItemsRef = useRef(filteredItems)
  const selectedIndexRef = useRef(selectedIndex)

  slashStateRef.current = slashState
  filteredItemsRef.current = filteredItems
  selectedIndexRef.current = selectedIndex

  slashUpdateRef.current = (state: SlashCommandState) => {
    setSlashState(state)
    setSelectedIndex(0)

    requestAnimationFrame(() => {
      const selection = window.getSelection()
      if (!selection?.rangeCount) return
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const editorRect = editorRef.current?.getBoundingClientRect()
      if (!editorRect) return
      setMenuPos({
        top: rect.bottom - editorRect.top + 8,
        left: Math.min(rect.left - editorRect.left, editorRect.width - 280),
      })
    })
  }

  slashCloseRef.current = () => {
    setSlashState((prev) => {
      if (!prev.active) return prev
      return { ...prev, active: false }
    })
  }

  /* -------------------------------------------------------
     Image upload
  ------------------------------------------------------- */

  async function uploadImage(file: File) {
    if (!token) {
      toast.error("Please sign in to upload images.")
      return
    }
    if (!file.type.startsWith("image/")) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.")
      return
    }
    if (!editor) return
    setUploadingImage(true)
    try {
      const upload = await uploadsApi.postImage(token, file)
      editor.chain().focus().setImage({ src: upload.url }).run()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image upload failed."
      )
    } finally {
      setUploadingImage(false)
    }
  }

  /* -------------------------------------------------------
     Insert video
  ------------------------------------------------------- */

  function insertVideo(url: string) {
    if (!editor) return
    const { embedUrl, provider } = parseVideoUrl(url)
    if (!embedUrl) {
      toast.error("Only YouTube and Vimeo URLs are supported.")
      return
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "inklyVideo",
        attrs: { src: embedUrl, provider },
      })
      .run()
    setShowVideoInput(false)
  }

  /* -------------------------------------------------------
     Editor
  ------------------------------------------------------- */

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: {
          HTMLAttributes: { class: "inkly-code-block" },
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") return "Heading..."
          return placeholder ?? "Write or press '/' for commands..."
        },
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-node-empty",
      }),
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "inkly-link",
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "inkly-image" },
      }),
      VideoNode,
      createSlashExtension(
        (state) => slashUpdateRef.current(state),
        () => slashCloseRef.current()
      ),
    ],
    content,
    editorProps: {
      attributes: {
        class: "inkly-editor-content",
      },
      handlePaste(_view, event) {
        const items = Array.from(event.clipboardData?.items ?? [])
        const imageItem = items.find((item) => item.type.startsWith("image/"))
        if (!imageItem) return false
        const file = imageItem.getAsFile()
        if (!file) return false
        uploadImage(file)
        return true
      },
      handleDrop(_view, event) {
        const files = Array.from(event.dataTransfer?.files ?? [])
        const image = files.find((f) => f.type.startsWith("image/"))
        if (!image) return false
        uploadImage(image)
        return true
      },
      handleKeyDown(_view, event) {
        const currentSlash = slashStateRef.current
        const currentItems = filteredItemsRef.current
        const currentIndex = selectedIndexRef.current

        if (!currentSlash.active || currentItems.length === 0) return false

        if (event.key === "ArrowDown") {
          event.preventDefault()
          setSelectedIndex((i) => (i + 1) % currentItems.length)
          return true
        }
        if (event.key === "ArrowUp") {
          event.preventDefault()
          setSelectedIndex(
            (i) => (i - 1 + currentItems.length) % currentItems.length
          )
          return true
        }
        if (event.key === "Enter") {
          event.preventDefault()
          executeSlashCommand(currentItems[currentIndex])
          return true
        }
        if (event.key === "Escape") {
          slashCloseRef.current()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  /* -------------------------------------------------------
     Execute slash command
  ------------------------------------------------------- */

  function executeSlashCommand(item: (typeof SLASH_ITEMS)[0]) {
    if (!editor) return

    slashRangeRef.current = slashStateRef.current.range
    editor.chain().focus().deleteRange(slashStateRef.current.range).run()
    slashCloseRef.current()

    if (item.title === "Image") {
      fileInputRef.current?.click()
      return
    }

    if (item.title === "Video") {
      setShowVideoInput(true)
      return
    }

    item.command(editor)
  }

  /* -------------------------------------------------------
     Content sync
  ------------------------------------------------------- */

  useEffect(() => {
    if (!editor) return
    const currentHTML = editor.getHTML()
    if (content && content !== currentHTML) {
      editor.commands.setContent(content, false)
    }
    if (!content && currentHTML !== "<p></p>") {
      editor.commands.clearContent()
    }
  }, [content, editor])

  /* -------------------------------------------------------
     Close slash menu on outside click
  ------------------------------------------------------- */

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as HTMLElement)
      ) {
        slashCloseRef.current()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  /* -------------------------------------------------------
     Link handler
  ------------------------------------------------------- */

  const currentLinkUrl = editor?.isActive("link")
    ? editor.getAttributes("link").href ?? ""
    : ""

  function applyLink(url: string) {
    if (!editor) return
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run()
    }
    setShowLinkPopover(false)
    setShowToolbarLink(false)
  }

  /* -------------------------------------------------------
     Loading
  ------------------------------------------------------- */

  if (!editor) {
    return (
      <div className="flex min-h-[560px] items-center justify-center">
        <Loader2 size={22} className="animate-spin text-[#FF6A00]" />
      </div>
    )
  }

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */

  return (
    <div ref={editorRef} className="inkly-novel-wrapper">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (file) uploadImage(file)
        }}
      />

      {/* Upload indicator */}
      {uploadingImage && (
        <div className="inkly-upload-toast">
          <Loader2 size={15} className="animate-spin text-[#FF6A00]" />
          <span>Uploading image...</span>
        </div>
      )}

      {/* Video input popover */}
      {showVideoInput && (
        <div
          className="inkly-video-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowVideoInput(false)
            }
          }}
        >
          <VideoInputPopover
            onInsert={insertVideo}
            onClose={() => setShowVideoInput(false)}
          />
        </div>
      )}

      {/* Static formatting toolbar */}
      {showToolbarLink ? (
        <div className="inkly-toolbar inkly-toolbar--link">
          <LinkPopover
            initialUrl={currentLinkUrl}
            onApply={applyLink}
            onClose={() => setShowToolbarLink(false)}
          />
        </div>
      ) : (
        <FormattingToolbar
          editor={editor}
          onLinkClick={() => setShowToolbarLink(true)}
          onImageClick={() => fileInputRef.current?.click()}
          onVideoClick={() => setShowVideoInput(true)}
        />
      )}

      {/* Bubble Menu — selection-based shortcut */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{
          duration: 100,
          placement: "top",
          onHide: () => setShowLinkPopover(false),
        }}
        shouldShow={({ editor, state }) => {
          const { selection } = state
          const { empty } = selection
          return !empty && editor.isEditable
        }}
      >
        <div className="inkly-bubble">
          {showLinkPopover ? (
            <LinkPopover
              initialUrl={currentLinkUrl}
              onApply={applyLink}
              onClose={() => setShowLinkPopover(false)}
            />
          ) : (
            <>
              <BubbleButton
                active={editor.isActive("bold")}
                title="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold size={13} />
              </BubbleButton>
              <BubbleButton
                active={editor.isActive("italic")}
                title="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic size={13} />
              </BubbleButton>
              <BubbleButton
                active={editor.isActive("link")}
                title="Link"
                onClick={() => setShowLinkPopover(true)}
              >
                <LinkIcon size={13} />
              </BubbleButton>

              <div className="inkly-bubble-divider" />

              <BubbleButton
                active={editor.isActive("heading", { level: 1 })}
                title="H1"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                <Heading1 size={13} />
              </BubbleButton>
              <BubbleButton
                active={editor.isActive("heading", { level: 2 })}
                title="H2"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                <Heading2 size={13} />
              </BubbleButton>
              <BubbleButton
                active={editor.isActive("heading", { level: 3 })}
                title="H3"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              >
                <Heading3 size={13} />
              </BubbleButton>

              <div className="inkly-bubble-divider" />

              <BubbleButton
                active={editor.isActive("blockquote")}
                title="Quote"
                onClick={() =>
                  editor.chain().focus().toggleBlockquote().run()
                }
              >
                <Quote size={13} />
              </BubbleButton>
              <BubbleButton
                active={editor.isActive("bulletList")}
                title="Bullet list"
                onClick={() =>
                  editor.chain().focus().toggleBulletList().run()
                }
              >
                <List size={13} />
              </BubbleButton>
              <BubbleButton
                active={editor.isActive("orderedList")}
                title="Numbered list"
                onClick={() =>
                  editor.chain().focus().toggleOrderedList().run()
                }
              >
                <ListOrdered size={13} />
              </BubbleButton>
            </>
          )}
        </div>
      </BubbleMenu>

      {/* Slash Command Menu */}
      {slashState.active && filteredItems.length > 0 && (
        <div
          ref={menuRef}
          style={{ top: menuPos.top, left: menuPos.left }}
          className="inkly-slash-wrapper"
        >
          <SlashCommandMenu
            items={filteredItems}
            selectedIndex={selectedIndex}
            onSelect={executeSlashCommand}
          />
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Footer */}
      <WordCount text={editor.getText()} />

      {/* Styles */}
      <style jsx global>{`
        /* =====================================================
           Wrapper
        ===================================================== */

        .inkly-novel-wrapper {
          position: relative;
          min-height: 560px;
          display: flex;
          flex-direction: column;
        }

        /* =====================================================
           Formatting Toolbar
        ===================================================== */

        .inkly-toolbar {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 6px 8px;
          border-bottom: 1px solid #F0EDE9;
          background: #F2F4F7;
          border-radius: 0;
          flex-wrap: wrap;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .inkly-toolbar--link {
          padding: 6px 12px;
        }

        .inkly-toolbar-group {
          display: flex;
          align-items: center;
          gap: 1px;
        }

        .inkly-toolbar-divider {
          width: 1px;
          height: 18px;
          background: #E5E7EB;
          margin: 0 4px;
          flex-shrink: 0;
        }

        .inkly-toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 6px;
          color: #6B7280;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.1s;
        }

        .inkly-toolbar-btn:hover {
          background: #EFEFEF;
          color: #141414;
        }

        .inkly-toolbar-btn--active {
          background: #FFF3E8;
          color: #FF6A00;
        }

        .inkly-toolbar-btn--active:hover {
          background: #FFE4D0;
          color: #E85F00;
        }

        .inkly-toolbar-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* =====================================================
           Editor content
        ===================================================== */

        .inkly-editor-content {
          flex: 1;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 18px;
          line-height: 1.85;
          color: #1a1a1a;
          outline: none;
          min-height: 480px;
          padding: 1.5rem 0 2rem;
        }

        .inkly-editor-content .is-editor-empty:first-child::before,
        .inkly-editor-content .is-node-empty::before {
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          color: #C0C4CA;
          font-style: italic;
          font-family: Georgia, serif;
        }

        /* =====================================================
           Typography
        ===================================================== */

        .inkly-editor-content p {
          margin-bottom: 1.2em;
          font-family: Georgia, "Times New Roman", serif;
        }

        .inkly-editor-content h1 {
          font-family: Inter, "Helvetica Neue", Arial, sans-serif;
          font-size: 2em;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.025em;
          margin-top: 2.25em;
          margin-bottom: 0.65em;
          color: #111111;
        }

        .inkly-editor-content h2 {
          font-family: Inter, "Helvetica Neue", Arial, sans-serif;
          font-size: 1.55em;
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: -0.02em;
          margin-top: 2em;
          margin-bottom: 0.6em;
          color: #141414;
        }

        .inkly-editor-content h3 {
          font-family: Inter, "Helvetica Neue", Arial, sans-serif;
          font-size: 1.2em;
          font-weight: 650;
          line-height: 1.35;
          letter-spacing: -0.01em;
          margin-top: 1.6em;
          margin-bottom: 0.5em;
          color: #141414;
        }

        /* =====================================================
           Blockquote
        ===================================================== */

        .inkly-editor-content blockquote {
          margin: 2rem 0;
          padding: 1rem 1.5rem;
          border-left: 3px solid #FF6A00;
          background: #FFF3E8;
          border-radius: 0 12px 12px 0;
          color: #36565F;
          font-style: italic;
          font-size: 1.05em;
          line-height: 1.75;
        }

        .inkly-editor-content blockquote p:last-child {
          margin-bottom: 0;
        }

        /* =====================================================
           Lists
        ===================================================== */

        .inkly-editor-content ul,
        .inkly-editor-content ol {
          padding-left: 1.6rem;
          margin-bottom: 1.3em;
          font-family: Georgia, serif;
        }

        .inkly-editor-content li {
          margin-bottom: 0.4em;
          line-height: 1.7;
        }

        .inkly-editor-content ul {
          list-style-type: disc;
        }

        .inkly-editor-content ol {
          list-style-type: decimal;
        }

        /* =====================================================
           Code
        ===================================================== */

        .inkly-editor-content code {
          background: #F2F4F7;
          border-radius: 5px;
          padding: 0.15em 0.42em;
          font-size: 0.86em;
          font-family: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
          color: #C0392B;
          letter-spacing: 0;
        }

        .inkly-editor-content pre,
        .inkly-code-block {
          background: #171717;
          color: #F5F5F5;
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          overflow-x: auto;
          margin: 2rem 0;
          font-size: 0.875em;
          line-height: 1.7;
          font-family: "JetBrains Mono", "Fira Code", monospace;
        }

        .inkly-editor-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }

        /* =====================================================
           Images
        ===================================================== */

        .inkly-image,
        .inkly-editor-content img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 2.25rem auto;
          border-radius: 12px;
          cursor: default;
        }

        .inkly-editor-content img.ProseMirror-selectednode {
          outline: 3px solid rgba(255, 106, 0, 0.3);
          outline-offset: 3px;
        }

        /* =====================================================
           Video block
        ===================================================== */

        .inkly-video-block {
          margin: 2.25rem 0;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
        }

        .inkly-video-ratio {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 */
        }

        .inkly-video-ratio iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        /* =====================================================
           Links
        ===================================================== */

        .inkly-link,
        .inkly-editor-content a {
          color: #FF6A00;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-thickness: 1px;
        }

        /* =====================================================
           Strong & em
        ===================================================== */

        .inkly-editor-content strong {
          color: #141414;
          font-weight: 700;
        }

        .inkly-editor-content em {
          font-style: italic;
          color: #2a2a2a;
        }

        /* =====================================================
           Selection
        ===================================================== */

        .inkly-editor-content ::selection {
          background: rgba(255, 106, 0, 0.15);
        }

        .inkly-editor-content:focus {
          outline: none;
        }

        /* =====================================================
           Bubble menu
        ===================================================== */

        .inkly-bubble {
          display: flex;
          align-items: center;
          gap: 1px;
          background: #1A1A1A;
          border-radius: 10px;
          padding: 4px 5px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .inkly-bubble-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 5px;
          color: #D1D5DB;
          transition: all 0.1s;
          border: none;
          background: transparent;
          cursor: pointer;
        }

        .inkly-bubble-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .inkly-bubble-btn--active {
          background: rgba(255, 90, 0, 0.3);
          color: #FF8040;
        }

        .inkly-bubble-divider {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.12);
          margin: 0 2px;
          flex-shrink: 0;
        }

        /* =====================================================
           Link popover
        ===================================================== */

        .inkly-link-popover {
          display: flex;
          align-items: center;
        }

        .inkly-link-popover-inner {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 4px;
        }

        .inkly-link-icon {
          color: #9CA3AF;
          flex-shrink: 0;
        }

        .inkly-link-input {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 13px;
          width: 200px;
        }

        .inkly-link-input::placeholder {
          color: #6B7280;
        }

        /* toolbar link input override */
        .inkly-toolbar--link .inkly-link-input {
          color: #141414;
          font-size: 13px;
          width: 240px;
          background: #F3F4F6;
          border-radius: 6px;
          padding: 4px 8px;
          border: 1px solid #E5E7EB;
        }

        .inkly-toolbar--link .inkly-link-input::placeholder {
          color: #9CA3AF;
        }

        .inkly-toolbar--link .inkly-link-icon {
          color: #6B7280;
        }

        .inkly-toolbar--link .inkly-link-apply,
        .inkly-toolbar--link .inkly-link-remove,
        .inkly-toolbar--link .inkly-link-open {
          color: #6B7280;
        }

        .inkly-link-apply,
        .inkly-link-remove,
        .inkly-link-open {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #9CA3AF;
          transition: color 0.1s, background 0.1s;
          flex-shrink: 0;
          text-decoration: none;
        }

        .inkly-link-apply:hover {
          color: #4ade80;
          background: rgba(74, 222, 128, 0.12);
        }

        .inkly-link-remove:hover {
          color: #f87171;
          background: rgba(248, 113, 113, 0.12);
        }

        .inkly-link-open:hover {
          color: #60a5fa;
          background: rgba(96, 165, 250, 0.12);
        }

        /* =====================================================
           Video input popover
        ===================================================== */

        .inkly-video-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(2px);
        }

        .inkly-video-popover {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 20px;
          width: 420px;
          max-width: calc(100vw - 32px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
        }

        .inkly-video-popover-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          font-size: 14px;
          font-weight: 600;
          color: #141414;
        }

        .inkly-video-popover-header svg {
          color: #FF6A00;
        }

        .inkly-video-close {
          margin-left: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 7px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: #9CA3AF;
          transition: background 0.1s, color 0.1s;
        }

        .inkly-video-close:hover {
          background: #F3F4F6;
          color: #374151;
        }

        .inkly-video-input {
          width: 100%;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: #141414;
          outline: none;
          transition: border-color 0.15s;
          margin-bottom: 6px;
          font-family: "JetBrains Mono", monospace;
        }

        .inkly-video-input:focus {
          border-color: #FF6A00;
        }

        .inkly-video-input::placeholder {
          color: #9CA3AF;
          font-family: Inter, sans-serif;
          font-size: 13px;
        }

        .inkly-video-error {
          font-size: 12px;
          color: #DC2626;
          margin: 0 0 10px;
        }

        .inkly-video-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .inkly-video-btn-primary {
          flex: 1;
          height: 38px;
          border: none;
          border-radius: 9px;
          background: #FF6A00;
          color: white;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }

        .inkly-video-btn-primary:hover {
          background: #E85F00;
        }

        .inkly-video-btn-secondary {
          height: 38px;
          padding: 0 16px;
          border: 1.5px solid #E5E7EB;
          border-radius: 9px;
          background: white;
          color: #374151;
          font-size: 13.5px;
          cursor: pointer;
          transition: background 0.1s;
        }

        .inkly-video-btn-secondary:hover {
          background: #F9FAFB;
        }

        /* =====================================================
           Slash command
        ===================================================== */

        .inkly-slash-wrapper {
          position: absolute;
          z-index: 50;
          width: 270px;
        }

        .inkly-slash-menu {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 14px;
          padding: 6px;
          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.06);
          max-height: 340px;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .inkly-slash-menu::-webkit-scrollbar {
          display: none;
        }

        .inkly-slash-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          border-radius: 9px;
          text-align: left;
          cursor: pointer;
          border: none;
          background: transparent;
          transition: background 0.1s;
        }

        .inkly-slash-item:hover,
        .inkly-slash-item--active {
          background: #F5F5F5;
        }

        .inkly-slash-item--active .inkly-slash-title {
          color: #FF6A00;
        }

        .inkly-slash-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #F3F4F6;
          color: #374151;
          flex-shrink: 0;
          transition: background 0.1s;
        }

        .inkly-slash-item--active .inkly-slash-icon {
          background: #FFF3E8;
          color: #FF6A00;
        }

        .inkly-slash-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .inkly-slash-title {
          font-size: 13px;
          font-weight: 500;
          color: #141414;
          line-height: 1.3;
        }

        .inkly-slash-desc {
          font-size: 11px;
          color: #9CA3AF;
          line-height: 1.3;
        }

        /* =====================================================
           Upload toast
        ===================================================== */

        .inkly-upload-toast {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #E8E3DD;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          font-size: 13px;
          color: #374151;
        }

        /* =====================================================
           Footer
        ===================================================== */

        .inkly-footer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0 0;
          border-top: 1px solid #E5E7EB;
          font-size: 12px;
          color: #9CA3AF;
          margin-top: auto;
          font-family: Inter, sans-serif;
        }

        .inkly-footer-divider {
          width: 1px;
          height: 12px;
          background: #D1D5DB;
        }

        /* =====================================================
           Mobile
        ===================================================== */

        @media (max-width: 768px) {
          .inkly-editor-content {
            font-size: 17px;
          }
          .inkly-editor-content h1 {
            font-size: 1.75em;
          }
          .inkly-editor-content h2 {
            font-size: 1.4em;
          }
          .inkly-editor-content h3 {
            font-size: 1.15em;
          }
          .inkly-slash-wrapper {
            width: 240px;
          }
          .inkly-link-input {
            width: 140px;
          }
          .inkly-video-popover {
            width: 100%;
            max-width: calc(100vw - 32px);
          }
          .inkly-toolbar {
            gap: 1px;
          }
        }
      `}</style>
    </div>
  )
}