declare module 'virtual:projects' {
  import type { Locale } from '../../lib/locale'
  import type { CompiledProject } from './build-projects'

  /** One snapshot per language, with the same slugs in both (Issue #83). */
  export const projects: Record<Locale, CompiledProject[]>
}
