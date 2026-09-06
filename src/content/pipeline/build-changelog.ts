import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { changelogFrontmatterSchema } from '../schemas/changelog.ts'
import { discoverEntries } from './discovery.ts'
import { parseFrontmatter } from './frontmatter.ts'
import { toHtml } from './markdown.ts'

const defaultChangelogDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'entries',
  'changelog',
)

export type CompiledChangelogEntry = {
  slug: string
  title: string
  /** Calendar date `YYYY-MM-DD`, never a `Date`, never a timestamp. */
  date: string
  html: string
}

/**
 * The single public entry point of the Changelog content pipeline (ADR-0003
 * P2, P4). Discovers, validates, and processes every entry synchronously and
 * returns an already-compiled, already-sorted snapshot. Throws on the first
 * invalid entry — content that fails validation must fail the build, never
 * reach the returned snapshot.
 *
 * Deliberately has no cache/memoization: it is a plain deterministic
 * function of `changelogDir`, called once per config evaluation by
 * `vite.config.ts`, which owns and distributes the resulting snapshot.
 *
 * Sort contract: `date` descending, with slug as a deterministic tie-break
 * when dates are equal — not a guarantee of fine-grained chronological
 * order within the same day. `date` is a calendar date (`YYYY-MM-DD`), not
 * a timestamp, so it carries no time-of-day information to order same-day
 * entries by actual sequence.
 */
export function buildChangelog(changelogDir = defaultChangelogDir): CompiledChangelogEntry[] {
  const discovered = discoverEntries(changelogDir)

  const entries = discovered.map(({ slug, raw }) => {
    const { frontmatter, body } = parseFrontmatter(raw, changelogFrontmatterSchema, slug)
    return {
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      html: toHtml(body),
    }
  })

  // `date` is `YYYY-MM-DD`, so lexicographic order is chronological order.
  // `Array.prototype.sort` is stable, so entries with the same date keep the
  // deterministic discovery order (by slug) from `discoverEntries`.
  return entries.sort((a, b) => b.date.localeCompare(a.date))
}
