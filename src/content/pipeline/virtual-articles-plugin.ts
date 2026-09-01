import type { Plugin } from 'vite'
import type { CompiledArticle } from './build-articles.ts'

const virtualModuleId = 'virtual:articles'
const resolvedVirtualModuleId = '\0' + virtualModuleId

/**
 * Exposes an already-compiled article snapshot to the application as a
 * Vite virtual module. Receives the snapshot as a parameter — it never
 * imports `buildArticles`, `discovery`, `frontmatter`, `markdown`, or any
 * of `node:fs` / `gray-matter` / `unified`. It only serializes data it was
 * handed; the compiler itself is unreachable from here.
 */
export function virtualArticlesPlugin(articles: CompiledArticle[]): Plugin {
  return {
    name: 'virtual-articles',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const articles = ${JSON.stringify(articles)}`
      }
    },
  }
}
