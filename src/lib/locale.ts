/**
 * The two languages Developer OS is published in (Issue #83, ADR-0011).
 *
 * English lives at the existing root URLs; Brazilian Portuguese mirrors them
 * under `/pt-br`, keeping the same path segments and slugs. That makes the
 * equivalence between languages a pure prefix transform — no mapping table —
 * and the URL the only source of truth for the language being shown: no
 * detection, no redirect, no stored preference.
 */
export type Locale = 'en' | 'pt-br'

const PT_BR_PREFIX = '/pt-br'

/** Path prefix of a locale, typed so it can build `<Link to>` literals. */
export function localePrefix(locale: Locale): '' | '/pt-br' {
  return locale === 'pt-br' ? PT_BR_PREFIX : ''
}

/** `/pt-br` and anything under `/pt-br/` is PT-BR; everything else is EN. */
export function localeFromPathname(pathname: string): Locale {
  return pathname === PT_BR_PREFIX || pathname.startsWith(`${PT_BR_PREFIX}/`) ? 'pt-br' : 'en'
}

/** Maps an English path (`/`, `/about`, `/blog/x`) to its path in `locale`. */
export function localizedPath(locale: Locale, englishPath: string): string {
  if (locale === 'en') return englishPath
  return englishPath === '/' ? PT_BR_PREFIX : `${PT_BR_PREFIX}${englishPath}`
}

/** The English path a pathname corresponds to, whatever its locale. */
export function englishPathOf(pathname: string): string {
  if (localeFromPathname(pathname) === 'en') return pathname
  const rest = pathname.slice(PT_BR_PREFIX.length)
  return rest === '' || rest === '/' ? '/' : rest
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'pt-br' : 'en'
}

/**
 * The same page in the other language. Every first-party page exists in both
 * (the build enforces it), so this never needs to fall back to a home page; a
 * path that does not exist maps to a path that does not exist either.
 */
export function counterpartPath(pathname: string): string {
  return localizedPath(otherLocale(localeFromPathname(pathname)), englishPathOf(pathname))
}

/** BCP 47 tag for `<html lang>`, `hreflang` and `lang` attributes. */
export function htmlLang(locale: Locale): 'en' | 'pt-BR' {
  return locale === 'pt-br' ? 'pt-BR' : 'en'
}
