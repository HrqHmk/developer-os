declare module 'virtual:articles' {
  import type { Locale } from '../../lib/locale'
  import type { CompiledArticle } from './build-articles'

  /** One snapshot per language, with the same slugs in both (Issue #83). */
  export const articles: Record<Locale, CompiledArticle[]>
}
