declare module 'virtual:changelog' {
  import type { Locale } from '../../lib/locale'
  import type { CompiledChangelogEntry } from './build-changelog'

  /** One snapshot per language, with the same slugs in both (Issue #83). */
  export const changelogEntries: Record<Locale, CompiledChangelogEntry[]>
}
