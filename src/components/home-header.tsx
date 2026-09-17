import { Link } from '@tanstack/react-router'
import { ThemeControl } from './theme-control'

const NAV_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/learning', label: 'Learning' },
  { to: '/about', label: 'About' },
  { to: '/search', label: 'Search' },
] as const

const FOCUS_RING = 'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

/**
 * Homepage-only header (Homepage Visual Refresh v1, Issue #57). No other
 * route renders this — it is not global chrome.
 *
 * Static: no sticky, no fixed, no scroll behavior. A single flex container
 * in DOM order (wordmark → nav → `ThemeControl`) so visual order matches
 * focus order at every width — column below `md`, row from `md` up. No
 * `order`, grid template areas, or reversed flex direction (Implementation
 * Plan v2, Finding 1 — Codex review).
 */
export function HomeHeader() {
  return (
    <header className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
      <Link to="/" className={`text-lg font-semibold text-foreground ${FOCUS_RING}`}>
        Developer OS
      </Link>
      <nav aria-label="Primary" className="flex flex-wrap gap-x-6 gap-y-2">
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
