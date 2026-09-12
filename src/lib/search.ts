import type { SearchDocument } from '../content/pipeline/search-index.ts'

/**
 * Field priority for a matched token (Issue #48).
 *
 * A document's score is the sum, over its unique query tokens, of the
 * weight of the highest-priority field that token appears in. For a
 * single-token query this is exactly "title outranks description outranks
 * body".
 *
 * For multi-word queries the score is an **aggregate**, so it does not give
 * title lexicographic dominance, and that is a deliberate property of this
 * algorithm rather than an oversight:
 *
 * - two tokens — `title(3) + body(1)` ties `description(2) + description(2)`,
 *   and the stable sort then decides by index order;
 * - three tokens — `description(2) x 3 = 6` strictly outranks
 *   `title(3) + body(1) + body(1) = 5`.
 *
 * Both cases are pinned by tests. Several matches in the description are
 * genuine evidence of relevance; the alternative, comparing a per-field
 * match vector lexicographically, would make "one weak title substring
 * beats three strong description matches" the surprising case instead.
 */
const FIELD_WEIGHTS = { title: 3, description: 2, body: 1 } as const

/**
 * Normalizes a raw query into the unique tokens to match on.
 *
 * Tokens are deduplicated so that `foo foo bar` means exactly what
 * `foo bar` means: a repeated token carries no extra information, and
 * scoring it twice would inflate a document's rank for no reason.
 */
function toTokens(query: string): string[] {
  const normalized = query.trim().toLowerCase()
  if (normalized === '') return []
  return [...new Set(normalized.split(/\s+/))]
}

/** The weight of the highest-priority field this token appears in, or 0. */
function scoreToken(document: SearchDocument, token: string): number {
  if (document.title.toLowerCase().includes(token)) return FIELD_WEIGHTS.title
  if (document.description.toLowerCase().includes(token)) return FIELD_WEIGHTS.description
  if (document.body.toLowerCase().includes(token)) return FIELD_WEIGHTS.body
  return 0
}

/**
 * Scores a document, or returns 0 when it does not match every token.
 *
 * A matching token always scores at least 1, so 0 is unambiguously "this
 * document is out" and needs no separate sentinel.
 */
function scoreDocument(document: SearchDocument, tokens: readonly string[]): number {
  let total = 0
  for (const token of tokens) {
    const tokenScore = scoreToken(document, token)
    if (tokenScore === 0) return 0
    total += tokenScore
  }
  return total
}

/**
 * Searches the build-time index in the browser (Issue #48).
 *
 * Case-insensitive, whitespace-trimmed, substring matching, with every
 * unique query token required to match somewhere. An empty or
 * whitespace-only query returns nothing at all rather than everything.
 *
 * Results are ordered by score descending. `Array.prototype.sort` is
 * stable, so ties keep index order — articles (newest first) before
 * projects — which is what makes the ordering deterministic without
 * inventing a tie-break rule.
 */
export function searchDocuments(
  documents: readonly SearchDocument[],
  query: string,
): SearchDocument[] {
  const tokens = toTokens(query)
  if (tokens.length === 0) return []

  return documents
    .map((document) => ({ document, score: scoreDocument(document, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ document }) => document)
}
