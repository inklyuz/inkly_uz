/**
 * Teletype'dan keladigan <document> formatidagi XML/HTML ni 
 * bizning TipTap va tizimimiz tushunadigan standart HTML formatiga o'zgartiradi.
 */
export function parseTeletypeToHtml(text: string): string {
  if (!text) return ""

  let html = text

  // 1. <document> tagini tozalash
  html = html.replace(/<document>/g, '<div class="teletype-content">')
  html = html.replace(/<\/document>/g, '</div>')

  // 2. <image src="..."><caption>...</caption></image> ni <figure><img><figcaption></figure> ga o'tkazish
  html = html.replace(/<image([^>]*)>([\s\S]*?)<\/image>/g, (match, attrs, content) => {
    const srcMatch = attrs.match(/src="([^"]+)"/)
    const src = srcMatch ? srcMatch[1] : ""

    let captionText = ""
    const captionMatch = content.match(/<caption>([\s\S]*?)<\/caption>/)
    if (captionMatch && captionMatch[1].trim()) {
      captionText = `<figcaption>${captionMatch[1].trim()}</figcaption>`
    }

    return `<figure><img src="${src}" alt="Image" />${captionText}</figure>`
  })

  // 3. <pre> ni <pre><code> formatiga o'tkazish
  html = html.replace(/<pre([^>]*)>([\s\S]*?)<\/pre>/g, (match, attrs, content) => {
    if (content.includes("<code")) {
      return match
    }
    return `<pre${attrs}><code>${content}</code></pre>`
  })

  // 4. Anchor attributlarini tozalash
  html = html.replace(/\sanchor="[^"]+"/g, '')

  return html
}
