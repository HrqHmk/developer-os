import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { ThemeControl } from './theme-control'

const NAV_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/learning', label: 'Learning' },
  { to: '/about', label: 'About' },
  { to: '/search', label: 'Search' },
] as const

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

/**
 * Homepage-only header (Homepage Visual Refresh v1, Issue #57). No other
 * route renders this — it is not global chrome.
 *
 * Static: no sticky, no fixed, no scroll behavior. A single flex container
 * in DOM order (wordmark → menu toggle → nav → `ThemeControl`) so visual
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
 */
export function HomeHeader() {
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
      <Link to="/" className={`text-lg font-semibold text-foreground ${FOCUS_RING}`}>
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
        <span className="sr-only">Menu</span>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4h12M2 8h12M2 12h12" />
        </svg>
      </button>
      <nav
        id={navId}
        aria-label="Primary"
        data-open={isOpen || undefined}
        onKeyDown={handleEscape}
        className="home-nav grid basis-full grid-cols-[repeat(3,max-content)] gap-x-6 gap-y-2 md:flex md:basis-auto md:flex-wrap"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-sm text-muted-foreground hover:text-foreground ${FOCUS_RING}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <ThemeControl />
    </header>
  )
}
