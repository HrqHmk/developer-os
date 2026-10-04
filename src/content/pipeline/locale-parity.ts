/**
 * Enforces language parity for one content type (Issue #83, ADR-0011): every
 * first-party entry exists in English and in PT-BR, and the fields that
 * describe the entry rather than its prose — dates, technologies, links — are
 * identical in both. A violation throws, failing the build the same way an
 * invalid frontmatter does (ADR-0003 P4): a missing translation must never
 * reach the site as a silent fallback to English.
 *
 * Throws on the first type checked, listing every offending slug at once so
 * one build run reports the whole gap.
 */
export function assertLocaleParity<Entry extends { slug: string }>(
  contentType: string,
  english: readonly Entry[],
  portuguese: readonly Entry[],
  invariantFields: readonly (keyof Entry)[],
): void {
  const englishSlugs = new Set(english.map((entry) => entry.slug))
  const portugueseBySlug = new Map(portuguese.map((entry) => [entry.slug, entry]))

  const missing = [...englishSlugs].filter((slug) => !portugueseBySlug.has(slug))
  const extra = [...portugueseBySlug.keys()].filter((slug) => !englishSlugs.has(slug))

  if (missing.length > 0 || extra.length > 0) {
    const problems = [
      missing.length > 0 ? `missing PT-BR translation for: ${missing.join(', ')}` : '',
      extra.length > 0 ? `PT-BR entries without an English original: ${extra.join(', ')}` : '',
    ].filter(Boolean)
    throw new Error(`${contentType}: ${problems.join('; ')}`)
  }

  const mismatches = english.flatMap((entry) => {
    const translation = portugueseBySlug.get(entry.slug) as Entry
    return invariantFields
      .filter((field) => JSON.stringify(entry[field]) !== JSON.stringify(translation[field]))
      .map((field) => `${entry.slug}.${String(field)}`)
  })

  if (mismatches.length > 0) {
    throw new Error(
      `${contentType}: fields that must be identical in both languages differ: ${mismatches.join(', ')}`,
    )
  }
}
