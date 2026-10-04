import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { ThemeControl } from './theme-control'
import { LanguageSwitch } from './language-switch'
import { localePrefix, type Locale } from '../lib/locale'

const NAV_PATHS = ['/projects', '/blog', '/learning', '/about', '/search'] as const

const COPY_EN = {
  menu: 'Menu',
  nav: 'Primary',
  links: {
    '/projects': 'Projects',
    '/blog': 'Blog',
    '/learning': 'Learning',
    '/about': 'About',
    '/search': 'Search',
  } satisfies Record<(typeof NAV_PATHS)[number], string>,
}

const COPY: Record<Locale, typeof COPY_EN> = {
  en: COPY_EN,
  'pt-br': {
    menu: 'Menu',
    nav: 'Principal',
    links: {
      '/projects': 'Projetos',
      '/blog': 'Blog',
      '/learning': 'Aprendizado',
      '/about': 'Sobre',
      '/search': 'Busca',
    },
  },
}

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

/**
 * Homepage-only header (Homepage Visual Refresh v1, Issue #57). No other
 * route renders this — it is not global chrome.
 *
 * Static: no sticky, no fixed, no scroll behavior. A single flex container
 * in DOM order (wordmark → menu toggle → nav → `LanguageSwitch` →
 * `ThemeControl`) so visual
 * order matches focus order at every width and in both menu states. No
 * `order`, grid template areas, or reversed flex direction (Implementation
 * Plan v2, Finding 1 — Codex review).
 *
 * Below `md` the nav collapses behind a disclosure toggle, so the closed
 * header is one row: wordmark, toggle, `ThemeControl`. Open, the nav takes
 * its own row as a 3-column grid (auto-placed, row-major) and `ThemeControl`
 * wraps below it. The collapse is CSS-only (`.home-nav` in `app.css`) and
 * applies only under the pre-paint `data-js` flag (`__root.tsx`): without
 * JavaScript the toggle is hidden and the nav stays visible. From `md` up the
 * toggle is hidden and the nav is the flex row as before (Issue #76,
 * Alternative B).
 *
 * Rendered by both home pages (`/` and `/pt-br`, Issue #83): `locale` picks
 * the copy and the language of every link.
 */
export function HomeHeader({ locale = 'en' }: Readonly<{ locale?: Locale }>) {
  const copy = COPY[locale]
  const prefix = localePrefix(locale)
  const navId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  function handleEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !isOpen) return
    setIsOpen(false)
    toggleRef.current?.focus()
  }

  return (
    <header className="flex flex-wrap items-center gap-4 px-6 py-6 md:flex-nowrap md:justify-between">
      <Link to={prefix || '/'} className={`text-lg font-semibold text-foreground ${FOCUS_RING}`}>
        Developer OS
      </Link>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={navId}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleEscape}
        className={`home-nav-toggle ml-auto h-8 w-8 items-center justify-center border border-muted-foreground text-foreground ${FOCUS_RING}`}
      >
        <span className="sr-only">{copy.menu}</span>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4h12M2 8h12M2 12h12" />
        </svg>
      </button>
      <nav
        id={navId}
        aria-label={copy.nav}
        data-open={isOpen || undefined}
        onKeyDown={handleEscape}
        className="home-nav grid basis-full grid-cols-[repeat(3,max-content)] gap-x-6 gap-y-2 md:flex md:basis-auto md:flex-wrap"
      >
        {NAV_PATHS.map((path) => (
          <Link
            key={path}
            to={`${prefix}${path}`}
            className={`text-sm text-muted-foreground hover:text-foreground ${FOCUS_RING}`}
          >
            {copy.links[path]}
          </Link>
        ))}
      </nav>
      {/* One flex item, so `md:justify-between` still spreads three groups
          (wordmark, nav, controls) exactly as before the switch existed. */}
      <div className="flex items-center gap-2">
        <LanguageSwitch />
        <ThemeControl locale={locale} />
      </div>
    </header>
  )
}
