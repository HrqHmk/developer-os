import type { CompiledArticle } from './build-articles.ts'
import type { CompiledProject } from './build-projects.ts'
import { htmlToPlainText } from './plain-text.ts'

/**
 * The article fields Search v1 consumes. `publishedAt` is deliberately
 * absent: it is not searchable, and the snapshot already arrives sorted by
 * it, which is the only ordering Search relies on (Issue #48).
 */
export type SearchArticleSource = Pick<
  CompiledArticle,
  'slug' | 'title' | 'description' | 'html'
>

/**
 * The project fields Search v1 consumes. `technologies` and `repositoryUrl`
 * are deliberately absent: Search v1 indexes title, description and body,
 * and nothing else (Issue #48). The narrowing is what makes that a
 * compile-time fact rather than a convention.
 */
export type SearchProjectSource = Pick<
  CompiledProject,
  'slug' | 'title' | 'description' | 'html'
>

export type SearchDocument = {
  type: 'article' | 'project'
  slug: string
  title: string
  description: string
  /** Plain text derived from the compiled `html`. Index-only. */
  body: string
}

/**
 * Maps the already-compiled Article and Project snapshots into the common
 * document shape the client-side search consumes (Issue #48).
 *
 * Pure, and deliberately without discovery of its own: it receives the two
 * canonical snapshots `vite.config.ts` already computed, so Search adds no
 * second discovery or parsing pipeline. Its only derivation is turning each
 * compiled `html` into plain text.
 *
 * Articles come first, preserving the `publishedAt` ordering `buildArticles`
 * established; projects follow in discovery order. Search sorts by score
 * with a stable sort, so this order is what breaks ties.
 */
export function buildSearchIndex(
  articles: readonly SearchArticleSource[],
  projects: readonly SearchProjectSource[],
): SearchDocument[] {
  return [
    ...articles.map((article) => toDocument('article', article)),
    ...projects.map((project) => toDocument('project', project)),
  ]
}

function toDocument(
  type: SearchDocument['type'],
  source: SearchArticleSource | SearchProjectSource,
): SearchDocument {
  return {
    type,
    slug: source.slug,
    title: source.title,
    description: source.description,
    body: htmlToPlainText(source.html),
  }
}
