import { useEffect, useId, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  DARK_MEDIA_QUERY,
  applyResolvedTheme,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
  type ThemePreference,
} from '../lib/theme'

/**
 * Global theme control: System / Light / Dark. Starts at 'system' to match
 * the server render (the pre-paint bootstrap in `__root.tsx` already applied
 * the resolved `.dark` class before this component mounts), then syncs to
 * the stored preference on mount. Fixed top-right — see the Dark Mode v1
 * plan (Issue #44) for why this control does not get a header/navbar.
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
    <div className="fixed top-4 right-4 z-50">
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
    </div>
  )
}
