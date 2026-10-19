import { Link, useRouterState } from '@tanstack/react-router'
import { localeFromPathname, localePrefix, type Locale } from '../lib/locale'

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
const LINK = `underline underline-offset-2 hover:text-foreground ${FOCUS_RING}`

export const CONTACT_EMAIL = 'hello@developeros.dev'

const COPY_EN = {
  notice: 'This site uses GoatCounter for aggregate visit statistics.',
  privacy: 'Privacy',
}

const COPY: Record<Locale, typeof COPY_EN> = {
  en: COPY_EN,
  'pt-br': {
    notice: 'Este site usa o GoatCounter para estatísticas agregadas de visitas.',
    privacy: 'Privacidade',
  },
}

/**
 * Global footer (Issue #95): the analytics notice, the privacy page in the
 * URL's language and the contact address. It is the site's first shared
 * chrome, rendered once by `__root.tsx` after the page — including the
 * not-found page — so pages keep owning their `<main>`. Static markup derived
 * from the URL only, so it is complete in the prerendered HTML and needs no
 * JavaScript.
 */
export function SiteFooter() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const locale = localeFromPathname(pathname)
  const copy = COPY[locale]

  return (
    <footer className="border-t border-border py-8 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-2xl flex-col gap-2 px-6">
        <p>{copy.notice}</p>
        <p className="flex flex-wrap gap-x-4 gap-y-2">
          <Link to={`${localePrefix(locale)}/privacy`} className={LINK}>
            {copy.privacy}
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </footer>
  )
}
