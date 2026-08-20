"use client"

import { parseTeletypeToHtml } from "@/lib/utils/teletype-parser"

interface ArticlePreviewProps {
  title: string
  excerpt: string
  content: string
  cover: string
}

export function ArticlePreview({
  title,
  excerpt,
  content,
  cover,
}: ArticlePreviewProps) {
  const sanitizedContent = parseTeletypeToHtml(content)

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
        {title || "Sarlavha yozing..."}
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
            sanitizedContent ||
            "<p>Maqola matni shu yerda ko'rinadi...</p>",
        }}
      />
    </article>
  )
}