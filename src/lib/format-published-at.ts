const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

/**
 * Formats an article's `publishedAt` (`YYYY-MM-DD`, a calendar date with no
 * time component) for display, e.g. `"2026-09-04"` → `"September 4, 2026"`.
 *
 * `timeZone: 'UTC'` is required, not cosmetic: an ISO date-only string parses
 * as UTC midnight, and formatting it in the visitor's local timezone can
 * shift the displayed day backward for any timezone behind UTC.
 */
export function formatPublishedAt(publishedAt: string): string {
  return formatter.format(new Date(`${publishedAt}T00:00:00Z`))
}
