import type { Locale } from './locale.ts'

const formatters: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }),
  'pt-br': new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }),
}

/**
 * Formats an article's `publishedAt` (`YYYY-MM-DD`, a calendar date with no
 * time component) for display, e.g. `"2026-09-04"` → `"September 4, 2026"`
 * in English and `"4 de setembro de 2026"` in PT-BR.
 *
 * `timeZone: 'UTC'` is required, not cosmetic: an ISO date-only string parses
 * as UTC midnight, and formatting it in the visitor's local timezone can
 * shift the displayed day backward for any timezone behind UTC.
 */
export function formatPublishedAt(publishedAt: string, locale: Locale = 'en'): string {
  return formatters[locale].format(new Date(`${publishedAt}T00:00:00Z`))
}
