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
export function ThemeControl() {
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
        Theme
      </label>
      <select
        id={selectId}
        value={preference}
        onChange={handlePreferenceChange}
        className="border border-muted-foreground bg-background px-2 py-1 text-sm text-foreground"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </>
  )
}

/**
 * Global floating placement of `ThemeControl` — fixed top-right, unchanged
 * since Dark Mode v1 (Issue #44). Renders nothing on `/`: the homepage's
 * `HomeHeader` renders `ThemeControl` inline instead, so there is exactly
 * one effective instance on every route (Homepage Visual Refresh v1, Issue
 * #57). Deterministic from the URL, so server and client render the same
 * thing — no portal, no hydration mismatch.
 */
export function FloatingThemeControl() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  if (pathname === '/') return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <ThemeControl />
    </div>
  )
}
