import { useRouterState } from '@tanstack/react-router'
import { localeFromPathname, type Locale } from '../lib/locale'

const MESSAGES: Record<Locale, string> = {
  en: 'Not Found',
  'pt-br': 'Página não encontrada',
}

/**
 * The router's default not-found component (Issue #83). Same minimal shape as
 * TanStack Router's built-in `<p>Not Found</p>` — so English is unchanged —
 * with the message in the language of the URL, so a missing `/pt-br/...` page
 * does not answer in English. Deliberately no redesign and no extra
 * navigation: localizing it is all the mission requires.
 */
export function NotFoundPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  return <p>{MESSAGES[localeFromPathname(pathname)]}</p>
}
