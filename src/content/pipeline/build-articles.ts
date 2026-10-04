import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Locale } from '../../lib/locale.ts'
import { articleFrontmatterSchema } from '../schemas/article.ts'
import { discoverEntries, entryFileName } from './discovery.ts'
import { parseFrontmatter } from './frontmatter.ts'
import { assertLocaleParity } from './locale-parity.ts'
import { toHtml } from './markdown.ts'

const defaultArticlesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'entries',
  'articles',
)

export type CompiledArticle = {
  slug: string
  title: string
  description: string
  /** Calendar date `YYYY-MM-DD`, never a `Date`, never a timestamp. */
  publishedAt: string
  html: string
}

/**
 * The single public entry point of the Article content pipeline (ADR-0003
 * P2, P4). Discovers, validates, and processes every article synchronously
 * and returns an already-compiled, already-sorted snapshot. Throws on the
 * first invalid article — content that fails validation must fail the
 * build, never reach the returned snapshot.
 *
 * Deliberately has no cache/memoization: it is a plain deterministic
 * function of `articlesDir`, called once per config evaluation by
 * `vite.config.ts`, which owns and distributes the resulting snapshot.
 */
export function buildArticles(
  articlesDir = defaultArticlesDir,
  locale: Locale = 'en',
): CompiledArticle[] {
  const discovered = discoverEntries(articlesDir, entryFileName(locale))

  const articles = discovered.map(({ slug, raw }) => {
    const { frontmatter, body } = parseFrontmatter(raw, articleFrontmatterSchema, slug)
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
  // keep the deterministic discovery order (by slug) from `discoverEntries`.
  return articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

/**
 * Both language snapshots of the Article type, built from the same entry
 * directories and checked for parity (Issue #83): the build fails if an
 * article lacks its PT-BR translation, or if the translation's `publishedAt`
 * differs from the original's.
 */
export function buildLocalizedArticles(
  articlesDir = defaultArticlesDir,
): Record<Locale, CompiledArticle[]> {
  const en = buildArticles(articlesDir, 'en')
  const ptBr = buildArticles(articlesDir, 'pt-br')
  assertLocaleParity('Article', en, ptBr, ['publishedAt'])
  return { en, 'pt-br': ptBr }
}
