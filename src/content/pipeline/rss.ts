import type { CompiledArticle } from './build-articles.ts'

/** Canonical origin of the published site. No trailing slash. */
export const CANONICAL_BASE_URL = 'https://developeros.dev'

/**
 * The article fields RSS v1 consumes. `html` is deliberately absent: the
 * feed carries summaries, not content (Issue #46).
 */
export type RssItemSource = Pick<
  CompiledArticle,
  'slug' | 'title' | 'description' | 'publishedAt'
>

/**
 * Serializes a Blog article snapshot as an RSS 2.0 document. Pure: no
 * `node:fs`, no `import.meta`, no clock read — the same input always
 * produces byte-identical output (Issue #46).
 */
export function toRssXml(articles: readonly RssItemSource[], baseUrl: string): string {
  const items = articles.map((article) => toItemXml(article, baseUrl)).join('')

  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<rss version="2.0">' +
    '<channel>' +
    `<title>${escapeXml('Developer OS')}</title>` +
    `<link>${escapeXml(`${baseUrl}/blog`)}</link>` +
    `<description>${escapeXml('Engineering software. Orchestrating AI. Learning in public.')}</description>` +
    '<language>en</language>' +
    items +
    '</channel>' +
    '</rss>'
  )
}

function toItemXml(article: RssItemSource, baseUrl: string): string {
  const url = articleUrl(article.slug, baseUrl)
  const pubDate = toRfc822(article.publishedAt)

  return (
    '<item>' +
    `<title>${escapeXml(article.title)}</title>` +
    `<link>${escapeXml(url)}</link>` +
    `<guid isPermaLink="true">${escapeXml(url)}</guid>` +
    `<pubDate>${pubDate}</pubDate>` +
    `<description>${escapeXml(article.description)}</description>` +
    '</item>'
  )
}

function articleUrl(slug: string, baseUrl: string): string {
  return `${baseUrl}/blog/${slug}`
}

/**
 * Converts a civil `publishedAt` date to an RFC-822/1123 string, treating
 * it as UTC midnight — the same convention `format-published-at.ts` uses.
 * `toUTCString()` is locale- and timezone-independent by specification.
 */
function toRfc822(publishedAt: string): string {
  return new Date(`${publishedAt}T00:00:00Z`).toUTCString()
}

/**
 * Escapes the three characters that are unsafe in an XML text node. `&`
 * must be replaced first, or entities inserted by this function would
 * themselves get escaped.
 */
function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
