type PostLike = {
  slug: string
  url?: string | null
  author: {
    username: string
  }
}

export function localPostHref(post: PostLike): string {
  if (post.url) {
    try {
      const parsed = new URL(post.url)
      return parsed.pathname
    } catch {
      if (post.url.startsWith("/")) return post.url
    }
  }
  return `/@${post.author.username}/${post.slug}`
}
