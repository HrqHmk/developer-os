export const THEME_STORAGE_KEY = 'theme'
export const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

export type ThemePreference = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export function normalizeThemePreference(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (preference === 'light') return 'light'
  if (preference === 'dark') return 'dark'
  return prefersDark ? 'dark' : 'light'
}

export function readThemePreference(): ThemePreference {
  try {
    return normalizeThemePreference(localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return 'system'
  }
}

export function writeThemePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Storage unavailable (private mode, quota, disabled) — preference just won't persist.
  }
}

export function applyResolvedTheme(theme: ResolvedTheme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/**
 * Executed inline, synchronously, before hydration — see `RootDocument`
 * (`src/routes/__root.tsx`). Duplicates the read/resolve/apply logic above
 * because a module import here would defer execution past first paint.
 * References `localStorage`/`matchMedia`/`document` as bare globals (not
 * `window.`-prefixed) so `theme.test.ts` can execute this exact string under
 * stubs and verify the shipped bytes, not a re-implementation of them.
 */
export const THEME_BOOTSTRAP_SCRIPT = `
try {
  var p = localStorage.getItem('${THEME_STORAGE_KEY}');
  var dark = p === 'dark' || (p !== 'light' && matchMedia('${DARK_MEDIA_QUERY}').matches);
  document.documentElement.classList.toggle('dark', dark);
} catch (e) {
  document.documentElement.classList.toggle('dark', matchMedia('${DARK_MEDIA_QUERY}').matches);
}
`.trim()
