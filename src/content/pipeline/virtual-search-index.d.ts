declare module 'virtual:search-index' {
  import type { Locale } from '../../lib/locale'
  import type { SearchDocument } from './search-index'

  export const searchIndex: Record<Locale, SearchDocument[]>
}
