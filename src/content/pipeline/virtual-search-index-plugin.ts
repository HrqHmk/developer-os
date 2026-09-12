import type { Plugin } from 'vite'
import type { SearchDocument } from './search-index.ts'

const virtualModuleId = 'virtual:search-index'
const resolvedVirtualModuleId = '\0' + virtualModuleId

/**
 * Exposes the already-built search index to the application as a Vite
 * virtual module (Issue #48). Receives the index as a parameter — it never
 * imports `search-index`, `plain-text`, `build-articles`, `build-projects`,
 * or any of `node:fs` / `gray-matter` / `unified`. It only serializes data
 * it was handed.
 *
 * Unlike `virtual:articles`/`virtual:projects`, this module carries a
 * derived artifact rather than a content type — the same relationship
 * `rss-asset-plugin.ts` has to the article snapshot.
 */
export function virtualSearchIndexPlugin(searchIndex: SearchDocument[]): Plugin {
  return {
    name: 'virtual-search-index',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const searchIndex = ${JSON.stringify(searchIndex)}`
      }
    },
  }
}
