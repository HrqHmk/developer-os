import type { Plugin } from 'vite'
import type { CompiledChangelogEntry } from './build-changelog.ts'

const virtualModuleId = 'virtual:changelog'
const resolvedVirtualModuleId = '\0' + virtualModuleId

/**
 * Exposes an already-compiled changelog snapshot to the application as a
 * Vite virtual module. Receives the snapshot as a parameter — it never
 * imports `buildChangelog`, `discovery`, `frontmatter`, `markdown`, or any
 * of `node:fs` / `gray-matter` / `unified`. It only serializes data it was
 * handed; the compiler itself is unreachable from here.
 */
export function virtualChangelogPlugin(entries: CompiledChangelogEntry[]): Plugin {
  return {
    name: 'virtual-changelog',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const changelogEntries = ${JSON.stringify(entries)}`
      }
    },
  }
}
