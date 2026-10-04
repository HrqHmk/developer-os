import { useRouterState } from '@tanstack/react-router'
import { counterpartPath, htmlLang, localeFromPathname, otherLocale } from '../lib/locale'

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

/** Each language is named in itself, the way a visitor looking for it reads it. */
const LANGUAGE_NAMES = { en: 'English', 'pt-br': 'Português' } as const

/**
 * Switches to the same page in the other language (Issue #83). A plain link,
 * not a control with state: the URL is the only source of truth for the
 * language, so switching is navigating to the counterpart URL — which every
 * first-party page has, by build-time parity. Works without JavaScript and is
 * keyboard-operable as any link is.
 *
 * Fragments and in-page state (a search query) are deliberately not carried
 * over; the equivalent page is the contract.
 *
 * `hrefLang` describes the target document; `lang` makes assistive technology
 * pronounce the label in its own language.
 */
export function LanguageSwitch() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const target = otherLocale(localeFromPathname(pathname))

  return (
    <a
      href={counterpartPath(pathname)}
      hrefLang={htmlLang(target)}
      lang={htmlLang(target)}
      className={`border border-muted-foreground bg-background px-2 py-1 text-sm text-foreground ${FOCUS_RING}`}
    >
      {LANGUAGE_NAMES[target]}
    </a>
  )
}
