// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The boundary keeps its coordination state at module scope (so Strict Mode's
 * remount cannot reset it), which means every test needs a fresh module —
 * otherwise one test's queue would leak into the next.
 */
async function loadBoundary(): Promise<typeof import('./analytics.ts')> {
  vi.resetModules()
  return import('./analytics.ts')
}

/**
 * Taken at load, before any test runs: the bootstrap script executes in several
 * tests, and a global leaked by the first would already be part of a snapshot
 * taken inside a later one.
 */
const GLOBALS_BEFORE_ANY_TEST = new Set(Object.keys(window))

type CountVars = { path: string; title?: string; event?: boolean }
type CountMock = ReturnType<typeof vi.fn<(vars: CountVars) => void>>

function setHostname(hostname: string, search = '') {
  vi.stubGlobal('location', { hostname, search })
}

/** What the document holds once the inline config ran but `count.js` has not. */
function installConfigOnly() {
  ;(window as Window & { goatcounter?: unknown }).goatcounter = { no_onload: true }
}

/** What the document holds once `count.js` has finished loading. */
function installVendor(count: CountMock) {
  ;(window as Window & { goatcounter?: unknown }).goatcounter = { no_onload: true, count }
}

/** The `<script data-goatcounter>` the boundary waits on for readiness. */
function addVendorScript(): HTMLScriptElement {
  const script = document.createElement('script')
  script.setAttribute('data-goatcounter', 'https://example.goatcounter.com/count')
  document.head.appendChild(script)
  return script
}

/** `count.js` finishing: it defines `count`, then the element fires `load`. */
function finishLoading(script: HTMLScriptElement, count: CountMock) {
  installVendor(count)
  script.dispatchEvent(new Event('load'))
}

function pathsSent(count: CountMock): string[] {
  return count.mock.calls.map(([vars]) => vars.path)
}

/**
 * A stand-in for the router adapter the root document provides, so the
 * coordination is exercised through `startPageviewTracking` without a route
 * harness. Once unsubscribed, nothing is delivered.
 */
function fakeRouter() {
  let listener: ((path: string) => void) | undefined
  const unsubscribe = vi.fn(() => {
    listener = undefined
  })
  return {
    subscribe: (onPath: (path: string) => void) => {
      listener = onPath
      return unsubscribe
    },
    resolve: (path: string) => listener?.(path),
    unsubscribe,
  }
}

function newCountMock(): CountMock {
  return vi.fn<(vars: CountVars) => void>()
}

beforeEach(() => {
  setHostname('developeros.dev')
})

afterEach(() => {
  vi.unstubAllGlobals()
  delete (window as Window & { goatcounter?: unknown }).goatcounter
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

describe('bootstrap script', () => {
  // Executes the exact string the root document ships, as `theme.test.ts` does
  // for the theme bootstrap. Indirect `eval` rather than `new Function`: an
  // inline `<script>` runs at global scope, and only there does a stray
  // top-level `var` become an observable global.
  async function runBootstrapScript() {
    const { GOATCOUNTER_BOOTSTRAP_SCRIPT } = await loadBoundary()
    ;(0, eval)(GOATCOUNTER_BOOTSTRAP_SCRIPT)
  }

  it('sets no_onload before the vendor script enters the document', async () => {
    // The order is the point: `count.js` reads `no_onload` the moment it runs,
    // and a config assigned afterwards would replace what it had defined.
    let configWhenAppended: unknown
    const appendChild = document.head.appendChild.bind(document.head)
    vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      configWhenAppended = (window as Window & { goatcounter?: unknown }).goatcounter
      return appendChild(node)
    })

    await runBootstrapScript()

    expect(configWhenAppended).toEqual({ no_onload: true })
  })

  it('adds exactly one async vendor script carrying its endpoint', async () => {
    await runBootstrapScript()

    const scripts = document.head.querySelectorAll('script[data-goatcounter]')
    expect(scripts).toHaveLength(1)
    const script = scripts[0] as HTMLScriptElement
    expect(script.async).toBe(true)
    expect(script.getAttribute('src')).toBe('//gc.zgo.at/count.js')
    expect(script.getAttribute('data-goatcounter')).toMatch(
      /^https:\/\/[a-z0-9-]+\.goatcounter\.com\/count$/,
    )
  })

  it('leaves no global other than the vendor config behind', async () => {
    await runBootstrapScript()
    // `location` is this file's own host stub (`beforeEach`), not the script's.
    const added = Object.keys(window).filter(
      (key) => key !== 'location' && !GLOBALS_BEFORE_ANY_TEST.has(key),
    )

    expect(added).toEqual(['goatcounter'])
  })
})

describe('payloads', () => {
  it('sends project_external_link_clicked as a fixed-name event', async () => {
    const { trackEvent } = await loadBoundary()
    const count = newCountMock()
    installVendor(count)

    trackEvent('project_external_link_clicked')

    expect(count).toHaveBeenCalledExactlyOnceWith({
      path: 'project_external_link_clicked',
      title: 'Project external link clicked',
      event: true,
    })
  })

  it('sends search_result_clicked as a fixed-name event', async () => {
    const { trackEvent } = await loadBoundary()
    const count = newCountMock()
    installVendor(count)

    trackEvent('search_result_clicked')

    expect(count).toHaveBeenCalledExactlyOnceWith({
      path: 'search_result_clicked',
      title: 'Search result clicked',
      event: true,
    })
  })

  it('derives no event field from user input or from the page', async () => {
    // Ambient input that a careless implementation could pick up: a typed
    // search query in the URL and in a live input. What this project controls
    // is what it puts in the payload; the vendor's own collection of campaign
    // parameters is out of this test's reach and is not claimed (Issue #52 §8).
    setHostname('developeros.dev', '?q=typed-secret')
    document.body.innerHTML = '<input value="typed-secret">'
    document.title = 'typed-secret'
    const { trackEvent } = await loadBoundary()
    const count = newCountMock()
    installVendor(count)

    trackEvent('search_result_clicked')

    const [vars] = count.mock.calls[0]
    expect(Object.keys(vars).sort()).toEqual(['event', 'path', 'title'])
    expect(JSON.stringify(vars)).not.toContain('typed-secret')
  })

  it('sends a pageview without the event flag', async () => {
    const { trackPageview } = await loadBoundary()
    const count = newCountMock()
    installVendor(count)

    trackPageview('/blog/x')

    expect(count).toHaveBeenCalledExactlyOnceWith({ path: '/blog/x' })
  })
})

describe('host guard', () => {
  it('counts on the exact production hostname', async () => {
    const { trackEvent, trackPageview } = await loadBoundary()
    const count = newCountMock()
    installVendor(count)

    trackPageview('/')
    trackEvent('search_result_clicked')

    expect(count).toHaveBeenCalledTimes(2)
  })

  it.each([
    'www.developeros.dev',
    'localhost',
    'developer-os.example-account.workers.dev',
    'preview-1a2b3c.developer-os.workers.dev',
    'example.com',
    'developeros.dev.example.com',
    'notdeveloperos.dev',
  ])('sends nothing from %s and queues nothing either', async (hostname) => {
    setHostname(hostname)
    const { trackEvent, trackPageview, readCoordinationState } = await loadBoundary()
    const count = newCountMock()
    installVendor(count)

    trackPageview('/')
    trackEvent('project_external_link_clicked')

    expect(count).not.toHaveBeenCalled()
    expect(readCoordinationState().pending).toEqual([])
  })

  it('throws nothing when the vendor is absent on the allowed host', async () => {
    const { trackEvent, trackPageview, startPageviewTracking } = await loadBoundary()

    expect(() => trackEvent('search_result_clicked')).not.toThrow()
    expect(() => trackPageview('/')).not.toThrow()
    expect(() => startPageviewTracking('/', () => () => {})).not.toThrow()
  })

  it('fails safely when reached without a window', async () => {
    const { trackEvent, trackPageview, startPageviewTracking } = await loadBoundary()
    vi.stubGlobal('window', undefined)

    expect(() => trackEvent('search_result_clicked')).not.toThrow()
    expect(() => trackPageview('/')).not.toThrow()
    expect(() => startPageviewTracking('/', () => () => {})).not.toThrow()
  })
})

describe('startup coordination', () => {
  it('holds the initial path until the vendor loads, then sends it once', async () => {
    const { startPageviewTracking } = await loadBoundary()
    const script = addVendorScript()
    installConfigOnly()
    const count = newCountMock()

    startPageviewTracking('/', fakeRouter().subscribe)
    expect(count).not.toHaveBeenCalled()

    finishLoading(script, count)
    expect(count).toHaveBeenCalledExactlyOnceWith({ path: '/' })
  })

  it('sends the initial path immediately, once, when the vendor is ready before subscription', async () => {
    const { startPageviewTracking } = await loadBoundary()
    const count = newCountMock()
    installVendor(count)
    const router = fakeRouter()

    startPageviewTracking('/', router.subscribe)
    expect(count).toHaveBeenCalledExactlyOnceWith({ path: '/' })

    // A router that also announces the initial load must not add a second one.
    router.resolve('/')
    expect(count).toHaveBeenCalledTimes(1)
  })

  it('does not duplicate the initial path when readiness comes after subscription', async () => {
    const { startPageviewTracking } = await loadBoundary()
    const script = addVendorScript()
    installConfigOnly()
    const count = newCountMock()
    const router = fakeRouter()

    startPageviewTracking('/', router.subscribe)
    router.resolve('/')
    finishLoading(script, count)

    expect(pathsSent(count)).toEqual(['/'])
  })

  it('sends a navigation that happened before readiness, in order, once each', async () => {
    const { startPageviewTracking } = await loadBoundary()
    const script = addVendorScript()
    installConfigOnly()
    const count = newCountMock()
    const router = fakeRouter()

    startPageviewTracking('/', router.subscribe)
    router.resolve('/blog')
    finishLoading(script, count)

    expect(pathsSent(count)).toEqual(['/', '/blog'])
  })

  it('sends navigations after readiness immediately', async () => {
    const { startPageviewTracking } = await loadBoundary()
    const count = newCountMock()
    installVendor(count)
    const router = fakeRouter()

    startPageviewTracking('/', router.subscribe)
    router.resolve('/blog')
    router.resolve('/blog/x')

    expect(pathsSent(count)).toEqual(['/', '/blog', '/blog/x'])
  })

  it('unsubscribes on cleanup, and resubscribing does not resend the current path', async () => {
    const { startPageviewTracking } = await loadBoundary()
    const count = newCountMock()
    installVendor(count)
    const first = fakeRouter()

    const cleanup = startPageviewTracking('/a', first.subscribe)
    cleanup()
    expect(first.unsubscribe).toHaveBeenCalledTimes(1)

    const second = fakeRouter()
    startPageviewTracking('/a', second.subscribe)
    expect(pathsSent(count)).toEqual(['/a'])

    second.resolve('/b')
    expect(pathsSent(count)).toEqual(['/a', '/b'])
  })

  it('sends the first path exactly once across mount, cleanup and remount before readiness', async () => {
    // Strict Mode's mount → cleanup → mount, with the vendor still loading.
    const { startPageviewTracking } = await loadBoundary()
    const script = addVendorScript()
    installConfigOnly()
    const count = newCountMock()

    const cleanup = startPageviewTracking('/a', fakeRouter().subscribe)
    cleanup()
    startPageviewTracking('/a', fakeRouter().subscribe)
    finishLoading(script, count)

    expect(pathsSent(count)).toEqual(['/a'])
  })

  it.each([
    ['vendor ready before anything resolves', 'before'],
    ['vendor ready between resolutions', 'between'],
    ['vendor ready after every resolution', 'after'],
  ] as const)('loses and duplicates no call purely because of load order: %s', async (_name, when) => {
    const { startPageviewTracking } = await loadBoundary()
    const script = addVendorScript()
    installConfigOnly()
    const count = newCountMock()
    const router = fakeRouter()

    if (when === 'before') finishLoading(script, count)
    startPageviewTracking('/', router.subscribe)
    router.resolve('/blog')
    if (when === 'between') finishLoading(script, count)
    router.resolve('/blog/x')
    if (when === 'after') finishLoading(script, count)

    // Asserted on the full ordered list, so a lost call and a duplicate both fail.
    expect(pathsSent(count)).toEqual(['/', '/blog', '/blog/x'])
  })
})

describe('pending is not sent', () => {
  it('preserves every pathname resolved before readiness — twelve, in order, none duplicated', async () => {
    // Guards against a silent cap: the queue has no limit, so a limit must
    // fail here rather than pass.
    const { startPageviewTracking } = await loadBoundary()
    const script = addVendorScript()
    installConfigOnly()
    const count = newCountMock()
    const router = fakeRouter()
    const paths = Array.from({ length: 12 }, (_, index) => `/page-${index}`)

    startPageviewTracking(paths[0], router.subscribe)
    for (const path of paths.slice(1)) router.resolve(path)
    finishLoading(script, count)

    expect(pathsSent(count)).toEqual(paths)
  })

  it('does not treat a queued pathname as counted', async () => {
    const { startPageviewTracking, readCoordinationState } = await loadBoundary()
    const script = addVendorScript()
    installConfigOnly()
    const count = newCountMock()

    startPageviewTracking('/a', fakeRouter().subscribe)
    expect(readCoordinationState()).toEqual({ pending: ['/a'], lastSent: null })
    expect(count).not.toHaveBeenCalled()

    finishLoading(script, count)
    expect(readCoordinationState()).toEqual({ pending: [], lastSent: '/a' })
    expect(pathsSent(count)).toEqual(['/a'])
  })

  it('leaves the queue intact when the load event fires but the vendor defines nothing', async () => {
    const { startPageviewTracking, readCoordinationState } = await loadBoundary()
    const script = addVendorScript()
    installConfigOnly()
    const router = fakeRouter()

    startPageviewTracking('/a', router.subscribe)
    router.resolve('/b')
    script.dispatchEvent(new Event('load'))

    expect(readCoordinationState()).toEqual({ pending: ['/a', '/b'], lastSent: null })
  })

  it('emits /a → /b → /a as three pageviews, comparing against the current path and not the history', async () => {
    const { startPageviewTracking, readCoordinationState } = await loadBoundary()
    const script = addVendorScript()
    installConfigOnly()
    const count = newCountMock()
    const router = fakeRouter()

    startPageviewTracking('/a', router.subscribe)
    router.resolve('/b')
    router.resolve('/a')
    router.resolve('/a') // the same path again is one resolution, not two
    expect(readCoordinationState().pending).toEqual(['/a', '/b', '/a'])

    finishLoading(script, count)
    expect(pathsSent(count)).toEqual(['/a', '/b', '/a'])
  })
})

describe('vendor exceptions', () => {
  it('keeps the failing pathname and everything after it pending when the vendor throws mid-flush', async () => {
    const { startPageviewTracking, readCoordinationState } = await loadBoundary()
    const script = addVendorScript()
    installConfigOnly()
    const router = fakeRouter()
    const escaped = vi.fn()
    window.addEventListener('error', escaped)

    // Succeeds for the first two pathnames, then throws — and keeps throwing,
    // so a loop that did not stop at the failure would spin on it.
    const count = newCountMock().mockImplementation(() => {
      if (count.mock.calls.length > 2) throw new Error('vendor failure')
    })

    startPageviewTracking('/a', router.subscribe)
    for (const path of ['/b', '/c', '/d', '/e']) router.resolve(path)
    finishLoading(script, count)
    window.removeEventListener('error', escaped)

    // Two sends and the one attempt that threw; nothing after it was tried.
    expect(pathsSent(count)).toEqual(['/a', '/b', '/c'])
    // Removed only after each normal return: a `splice()`-first drain would
    // have lost all three of these.
    expect(readCoordinationState()).toEqual({ pending: ['/c', '/d', '/e'], lastSent: '/b' })
    expect(escaped).not.toHaveBeenCalled()
  })

  it('contains a throwing vendor in a pageview and in an event, and does not queue the pathname', async () => {
    const { trackEvent, trackPageview, readCoordinationState } = await loadBoundary()
    const count = newCountMock().mockImplementation(() => {
      throw new Error('vendor failure')
    })
    installVendor(count)

    expect(() => trackPageview('/a')).not.toThrow()
    expect(() => trackEvent('search_result_clicked')).not.toThrow()

    // A failed send is neither marked sent nor queued: queuing it would be a
    // retry, and no further readiness event exists to act on it.
    expect(readCoordinationState()).toEqual({ pending: [], lastSent: null })
  })
})
