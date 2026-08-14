"use client"

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Bold, Italic, Link as LinkIcon, Heading2, Heading3, Quote, Image as ImageIcon, Code } from "lucide-react"

interface InklyEditorProps {
  content: string
  onChange: (content: string) => void
}

export function InklyEditor({ content, onChange }: InklyEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "O'z hikoyangizni yozing...",
        emptyEditorClass: "is-editor-empty",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#FF6A00] underline underline-offset-4 cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl overflow-hidden w-full object-cover my-6',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose-inkly max-w-none focus:outline-none min-h-[500px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL ni kiriting:', previousUrl)
    
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('Rasm URL manzilini kiriting:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="relative">
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex overflow-hidden rounded-full border border-[#E8E3DD] bg-white shadow-lg">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 hover:bg-[#F2F4F7] transition-colors ${editor.isActive('bold') ? 'text-[#FF6A00]' : 'text-[#36565F]'}`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 hover:bg-[#F2F4F7] transition-colors ${editor.isActive('italic') ? 'text-[#FF6A00]' : 'text-[#36565F]'}`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={setLink}
          className={`p-2 hover:bg-[#F2F4F7] transition-colors ${editor.isActive('link') ? 'text-[#FF6A00]' : 'text-[#36565F]'}`}
          title="Link"
        >
          <LinkIcon size={18} />
        </button>
        <div className="w-[1px] bg-[#E8E3DD] my-1 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 hover:bg-[#F2F4F7] transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-[#FF6A00]' : 'text-[#36565F]'}`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 hover:bg-[#F2F4F7] transition-colors ${editor.isActive('heading', { level: 3 }) ? 'text-[#FF6A00]' : 'text-[#36565F]'}`}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>
        <div className="w-[1px] bg-[#E8E3DD] my-1 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 hover:bg-[#F2F4F7] transition-colors ${editor.isActive('blockquote') ? 'text-[#FF6A00]' : 'text-[#36565F]'}`}
          title="Quote"
        >
          <Quote size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 hover:bg-[#F2F4F7] transition-colors ${editor.isActive('codeBlock') ? 'text-[#FF6A00]' : 'text-[#36565F]'}`}
          title="Code Block"
        >
          <Code size={18} />
        </button>
      </BubbleMenu>

      <FloatingMenu editor={editor} tippyOptions={{ duration: 100, placement: 'left' }}>
        <button
          onClick={addImage}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E3DD] bg-white text-[#36565F] hover:bg-[#F2F4F7] hover:text-[#FF6A00] transition-colors -ml-12 shadow-sm"
          title="Rasm qo'shish"
        >
          <ImageIcon size={18} />
        </button>
      </FloatingMenu>

      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #949494; /* Teletype placeholder color */
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
          font-family: Inter, "Helvetica Neue", Helvetica, sans-serif;
          font-size: 17px;
          line-height: 1.5;
        }
        .ProseMirror p {
          margin-bottom: 1.2em;
        }
        .ProseMirror h2 {
          font-size: 1.75em;
          font-weight: 700;
          margin-top: 1.8em;
          margin-bottom: 0.8em;
          line-height: 1.3;
        }
        .ProseMirror h3 {
          font-size: 1.35em;
          font-weight: 600;
          margin-top: 1.6em;
          margin-bottom: 0.6em;
          line-height: 1.4;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #141414;
          padding-left: 1.25rem;
          margin-left: 0;
          font-style: italic;
          color: #36565F;
        }
      `}</style>
    </div>
  )
}
