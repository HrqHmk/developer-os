import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DARK_MEDIA_QUERY,
  THEME_BOOTSTRAP_SCRIPT,
  THEME_STORAGE_KEY,
  applyResolvedTheme,
  normalizeThemePreference,
  readThemePreference,
  resolveTheme,
  writeThemePreference,
} from './theme'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('normalizeThemePreference', () => {
  it('passes through light, dark, and system', () => {
    expect(normalizeThemePreference('light')).toBe('light')
    expect(normalizeThemePreference('dark')).toBe('dark')
    expect(normalizeThemePreference('system')).toBe('system')
  })

  it('falls back to system for null, unrecognized, or empty values', () => {
    expect(normalizeThemePreference(null)).toBe('system')
    expect(normalizeThemePreference('bogus')).toBe('system')
    expect(normalizeThemePreference('')).toBe('system')
  })
})

describe('resolveTheme', () => {
  it('follows the OS when preference is system', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })

  it('an explicit preference is never overridden by the OS', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
})

describe('readThemePreference', () => {
  it('returns system when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(readThemePreference()).toBe('system')
  })

  it('returns system when localStorage.getItem throws', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('blocked')
      },
    })
    expect(readThemePreference()).toBe('system')
  })

  it('returns system for an unrecognized stored value', () => {
    vi.stubGlobal('localStorage', { getItem: () => 'bogus' })
    expect(readThemePreference()).toBe('system')
  })

  it('returns the stored preference when valid', () => {
    vi.stubGlobal('localStorage', { getItem: () => 'dark' })
    expect(readThemePreference()).toBe('dark')
  })
})

describe('writeThemePreference', () => {
  it('does not throw when localStorage.setItem throws', () => {
    vi.stubGlobal('localStorage', {
      setItem() {
        throw new Error('quota exceeded')
      },
    })
    expect(() => writeThemePreference('dark')).not.toThrow()
  })

  it('writes the preference under the shared storage key', () => {
    const setItem = vi.fn()
    vi.stubGlobal('localStorage', { setItem })
    writeThemePreference('light')
    expect(setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'light')
  })
})

function createClassListStub(initial: string[] = []) {
  const classes = new Set(initial)
  return {
    classes,
    toggle(name: string, force?: boolean) {
      const shouldHave = force ?? !classes.has(name)
      if (shouldHave) classes.add(name)
      else classes.delete(name)
      return shouldHave
    },
  }
}

describe('applyResolvedTheme', () => {
  it('applies the dark class for the dark theme', () => {
    const classList = createClassListStub()
    vi.stubGlobal('document', { documentElement: { classList } })

    applyResolvedTheme('dark')

    expect(classList.classes.has('dark')).toBe(true)
  })

  it('removes the dark class for the light theme', () => {
    const classList = createClassListStub(['dark'])
    vi.stubGlobal('document', { documentElement: { classList } })

    applyResolvedTheme('light')

    expect(classList.classes.has('dark')).toBe(false)
  })
})

/**
 * Executes the exact string shipped as the pre-paint bootstrap (see
 * `THEME_BOOTSTRAP_SCRIPT` in `theme.ts`) under minimal stubs, so these tests
 * verify the shipped bytes rather than a separate re-implementation of them.
 * The script references `localStorage`, `matchMedia`, and `document` as bare
 * globals, which the function parameters below shadow.
 */
function runBootstrap({
  storedValue = null,
  storageThrows = false,
  prefersDark,
  initialClasses = [],
}: {
  storedValue?: string | null
  storageThrows?: boolean
  prefersDark: boolean
  initialClasses?: string[]
}) {
  const classList = createClassListStub(initialClasses)
  const document = { documentElement: { classList } }

  const getItemCalls: string[] = []
  const localStorage = {
    getItem(key: string) {
      getItemCalls.push(key)
      if (storageThrows) throw new Error('blocked')
      return storedValue
    },
  }

  const matchMediaCalls: string[] = []
  const matchMedia = (query: string) => {
    matchMediaCalls.push(query)
    return { matches: prefersDark }
  }

  const run = new Function('localStorage', 'matchMedia', 'document', THEME_BOOTSTRAP_SCRIPT)
  run(localStorage, matchMedia, document)

  return { classes: classList.classes, getItemCalls, matchMediaCalls }
}

describe('THEME_BOOTSTRAP_SCRIPT', () => {
  it('follows the OS when no preference is stored and the OS prefers dark', () => {
    const { classes } = runBootstrap({ storedValue: null, prefersDark: true })
    expect(classes.has('dark')).toBe(true)
  })

  it('follows the OS when no preference is stored and the OS prefers light', () => {
    const { classes } = runBootstrap({ storedValue: null, prefersDark: false })
    expect(classes.has('dark')).toBe(false)
  })

  it('follows the OS when the stored preference is "system"', () => {
    const { classes } = runBootstrap({ storedValue: 'system', prefersDark: true })
    expect(classes.has('dark')).toBe(true)
  })

  it('follows the OS when the stored value is invalid', () => {
    const { classes } = runBootstrap({ storedValue: 'bogus', prefersDark: true })
    expect(classes.has('dark')).toBe(true)
  })

  it('an explicit light preference ignores an OS dark preference', () => {
    const { classes } = runBootstrap({ storedValue: 'light', prefersDark: true })
    expect(classes.has('dark')).toBe(false)
  })

  it('an explicit dark preference ignores an OS light preference', () => {
    const { classes } = runBootstrap({ storedValue: 'dark', prefersDark: false })
    expect(classes.has('dark')).toBe(true)
  })

  it('falls back to the OS when localStorage throws, OS prefers dark', () => {
    const { classes } = runBootstrap({ storageThrows: true, prefersDark: true })
    expect(classes.has('dark')).toBe(true)
  })

  it('falls back to the OS when localStorage throws, OS prefers light', () => {
    const { classes } = runBootstrap({ storageThrows: true, prefersDark: false })
    expect(classes.has('dark')).toBe(false)
  })

  it('removes a pre-existing dark class when the resolved theme is light', () => {
    const { classes } = runBootstrap({
      storedValue: 'light',
      prefersDark: true,
      initialClasses: ['dark'],
    })
    expect(classes.has('dark')).toBe(false)
  })

  it('reads the shared storage key and the shared media query', () => {
    const { getItemCalls, matchMediaCalls } = runBootstrap({ storedValue: null, prefersDark: true })
    expect(getItemCalls).toEqual([THEME_STORAGE_KEY])
    expect(matchMediaCalls).toEqual([DARK_MEDIA_QUERY])
  })
})
