import { useEffect, useId, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useRouterState } from '@tanstack/react-router'
import {
  DARK_MEDIA_QUERY,
  applyResolvedTheme,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
  type ThemePreference,
} from '../lib/theme'
import { localeFromPathname, type Locale } from '../lib/locale'
import { LanguageSwitch } from './language-switch'

const COPY_EN = {
  label: 'Theme',
  options: { system: 'System', light: 'Light', dark: 'Dark' } satisfies Record<ThemePreference, string>,
}

const COPY: Record<Locale, typeof COPY_EN> = {
  en: COPY_EN,
  'pt-br': {
    label: 'Tema',
    options: { system: 'Sistema', light: 'Claro', dark: 'Escuro' },
  },
}

/**
 * Theme control: System / Light / Dark. Starts at 'system' to match the
 * server render (the pre-paint bootstrap in `__root.tsx` already applied the
 * resolved `.dark` class before this component mounts), then syncs to the
 * stored preference on mount.
 *
 * Renders no positioning of its own — `HomeHeader` places it inline on `/`,
 * and `FloatingThemeControl` below places it everywhere else (Homepage
 * Visual Refresh v1, Issue #57).
 */
export function ThemeControl({ locale = 'en' }: Readonly<{ locale?: Locale }>) {
  const copy = COPY[locale]
  const selectId = useId()
  const [preference, setPreference] = useState<ThemePreference>('system')

  useEffect(() => {
    setPreference(readThemePreference())
  }, [])

  useEffect(() => {
    if (preference !== 'system') return

    const media = matchMedia(DARK_MEDIA_QUERY)
    const handleMediaChange = (event: MediaQueryListEvent) => {
      applyResolvedTheme(resolveTheme('system', event.matches))
    }

    media.addEventListener('change', handleMediaChange)
    return () => media.removeEventListener('change', handleMediaChange)
  }, [preference])

  function handlePreferenceChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as ThemePreference
    setPreference(next)
    writeThemePreference(next)
    applyResolvedTheme(resolveTheme(next, matchMedia(DARK_MEDIA_QUERY).matches))
  }

  return (
    <>
      <label htmlFor={selectId} className="sr-only">
        {copy.label}
      </label>
      <select
        id={selectId}
        value={preference}
        onChange={handlePreferenceChange}
        className="border border-muted-foreground bg-background px-2 py-1 text-sm text-foreground"
      >
        <option value="system">{copy.options.system}</option>
        <option value="light">{copy.options.light}</option>
        <option value="dark">{copy.options.dark}</option>
      </select>
    </>
  )
}

/**
 * Global floating placement of `ThemeControl` — fixed top-right, unchanged
 * since Dark Mode v1 (Issue #44). Renders nothing on either home page (`/`
 * and `/pt-br`): `HomeHeader` renders `ThemeControl` inline there instead,
 * so there is exactly one effective instance on every route (Homepage Visual
 * Refresh v1, Issue #57). Deterministic from the URL, so server and client
 * render the same thing — no portal, no hydration mismatch.
 *
 * It is also the only chrome present on every other route, so it carries the
 * `LanguageSwitch` there, placed before the theme selector to keep DOM order
 * equal to visual order (Issue #83).
 */
export function FloatingThemeControl() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  if (pathname === '/' || pathname === '/pt-br' || pathname === '/pt-br/') return null

  const locale = localeFromPathname(pathname)

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <LanguageSwitch />
      <ThemeControl locale={locale} />
    </div>
  )
}
