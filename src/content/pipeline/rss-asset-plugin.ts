import type { Plugin } from 'vite'
import type { CompiledArticle } from './build-articles.ts'
import { CANONICAL_BASE_URL, toRssXml } from './rss.ts'

/**
 * Emits `rss.xml` as a static asset in the client build output. Receives
 * the already-compiled article snapshot as a parameter — it never imports
 * `build-articles.ts` at value level, only its type (Issue #46).
 */
export function rssAssetPlugin(articles: CompiledArticle[]): Plugin {
  return {
    name: 'rss-asset',
    applyToEnvironment: (environment) => environment.name === 'client',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'rss.xml',
        source: toRssXml(articles, CANONICAL_BASE_URL),
      })
    },
  }
}
