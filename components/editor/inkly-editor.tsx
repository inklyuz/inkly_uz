"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"

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
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[500px] text-[#141414] leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="relative">
      <EditorContent editor={editor} />
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #6B7280;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 700;
          margin-top: 2em;
          margin-bottom: 0.5em;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #E8E3DD;
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: #36565F;
        }
      `}</style>
    </div>
  )
}
