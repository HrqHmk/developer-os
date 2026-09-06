declare module 'virtual:changelog' {
  import type { CompiledChangelogEntry } from './build-changelog'

  export const changelogEntries: CompiledChangelogEntry[]
}
