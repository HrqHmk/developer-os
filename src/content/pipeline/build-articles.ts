import { defaultArticlesDir, discoverArticles } from './discovery.ts'
import { parseFrontmatter } from './frontmatter.ts'
import { toHtml } from './markdown.ts'

export type CompiledArticle = {
  slug: string
  title: string
  description: string
  /** Calendar date `YYYY-MM-DD`, never a `Date`, never a timestamp. */
  publishedAt: string
  html: string
}

/**
 * The single public entry point of the content pipeline (ADR-0003 P2, P4).
 * Discovers, validates, and processes every article synchronously and
 * returns an already-compiled, already-sorted snapshot. Throws on the
 * first invalid article — content that fails validation must fail the
 * build, never reach the returned snapshot.
 *
 * Deliberately has no cache/memoization: it is a plain deterministic
 * function of `articlesDir`, called once per config evaluation by
 * `vite.config.ts`, which owns and distributes the resulting snapshot.
 */
export function buildArticles(articlesDir = defaultArticlesDir): CompiledArticle[] {
  const discovered = discoverArticles(articlesDir)

  const articles = discovered.map(({ slug, raw }) => {
    const { frontmatter, body } = parseFrontmatter(raw, slug)
    return {
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      publishedAt: frontmatter.publishedAt,
      html: toHtml(body),
    }
  })

  // `publishedAt` is `YYYY-MM-DD`, so lexicographic order is chronological
  // order. `Array.prototype.sort` is stable, so articles with the same date
  // keep the deterministic discovery order (by slug) from `discoverArticles`.
  return articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}
