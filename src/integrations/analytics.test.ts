// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ANALYTICS_BOOTSTRAP_SCRIPT } from './analytics'

type Vars = { path: string; title: string }
type GoatCounterWindow = Window & { goatcounter?: { count?: (vars: Vars) => void; no_onload?: boolean } }

const ALLOWED_HOST = 'developeros.dev'
const DENIED_HOSTS = [
  'www.developeros.dev',
  'localhost',
  '127.0.0.1',
  'x.workers.dev',
  'developeros.dev.example.com',
  'evil-developeros.dev',
]

async function loadModule() {
  vi.resetModules()
  return import('./analytics')
}

function setLocation(hostname: string, search = '') {
  vi.stubGlobal('location', { hostname, search })
}

function setVendorCount(count: ((vars: Vars) => void) | undefined) {
  ;(window as GoatCounterWindow).goatcounter = count ? { count } : {}
}

function addVendorScript() {
  const script = document.createElement('script')
  script.setAttribute('data-goatcounter', 'https://example.test/count')
  document.head.appendChild(script)
  return script
}

beforeEach(() => {
  document.title = ''
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  delete (window as GoatCounterWindow).goatcounter
  document.head.querySelectorAll('script[data-goatcounter]').forEach((node) => node.remove())
})

describe('trackPageview', () => {
  it('sends exactly { path, title } once when the vendor is ready', async () => {
    const { trackPageview } = await loadModule()
    const count = vi.fn()
    setLocation(ALLOWED_HOST)
    setVendorCount(count)
    document.title = 'About'

    trackPageview('/about')

    expect(count).toHaveBeenCalledTimes(1)
    expect(count).toHaveBeenCalledWith({ path: '/about', title: 'About' })
  })

  it.each(DENIED_HOSTS)('sends nothing on %s', async (host) => {
    const { trackPageview } = await loadModule()
    const count = vi.fn()
    setLocation(host)
    setVendorCount(count)

    trackPageview('/about')

    expect(count).not.toHaveBeenCalled()
  })

  it('does not throw or send without a window (prerender/SSR)', async () => {
    const { trackPageview } = await loadModule()
    vi.stubGlobal('window', undefined)

    expect(() => trackPageview('/')).not.toThrow()
  })

  it('sends once when the same path is reported twice (Strict Mode, remount)', async () => {
    const { trackPageview } = await loadModule()
    const count = vi.fn()
    setLocation(ALLOWED_HOST)
    setVendorCount(count)

    trackPageview('/a')
    trackPageview('/a')

    expect(count).toHaveBeenCalledTimes(1)
  })

  it('holds the first page until the vendor loads, then sends it exactly once', async () => {
    const { trackPageview } = await loadModule()
    const count = vi.fn()
    setLocation(ALLOWED_HOST)
    document.title = 'A'
    const script = addVendorScript()

    trackPageview('/a')
    expect(count).not.toHaveBeenCalled()

    setVendorCount(count)
    script.dispatchEvent(new Event('load'))
    script.dispatchEvent(new Event('load'))

    expect(count).toHaveBeenCalledTimes(1)
    expect(count).toHaveBeenCalledWith({ path: '/a', title: 'A' })
  })

  it('drops intermediate navigations before readiness and counts later ones in order', async () => {
    const { trackPageview } = await loadModule()
    const count = vi.fn()
    setLocation(ALLOWED_HOST)
    const script = addVendorScript()

    trackPageview('/a')
    trackPageview('/b')
    setVendorCount(count)
    script.dispatchEvent(new Event('load'))
    trackPageview('/c')
    trackPageview('/a')

    expect(count.mock.calls.map(([vars]) => vars.path)).toEqual(['/a', '/c', '/a'])
  })

  it('sends nothing when the vendor loads without a count function, and never re-sends later', async () => {
    const { trackPageview } = await loadModule()
    setLocation(ALLOWED_HOST)
    const script = addVendorScript()

    trackPageview('/a')
    setVendorCount(undefined)
    expect(() => script.dispatchEvent(new Event('load'))).not.toThrow()

    const count = vi.fn()
    setVendorCount(count)
    trackPageview('/b')

    expect(count).toHaveBeenCalledTimes(1)
    expect(count).toHaveBeenCalledWith({ path: '/b', title: '' })
  })

  it('contains a throwing vendor, directly and on flush, and keeps counting', async () => {
    const { trackPageview } = await loadModule()
    setLocation(ALLOWED_HOST)
    const script = addVendorScript()
    const count = vi.fn<(vars: Vars) => void>(() => {
      throw new Error('vendor failure')
    })

    trackPageview('/a')
    setVendorCount(count)
    expect(() => script.dispatchEvent(new Event('load'))).not.toThrow()
    expect(() => trackPageview('/b')).not.toThrow()

    count.mockImplementation(() => undefined)
    trackPageview('/c')

    expect(count.mock.calls.map(([vars]) => vars.path)).toEqual(['/a', '/b', '/c'])
  })

  it('does not throw or send when no vendor script exists (blocked, not injected)', async () => {
    const { trackPageview } = await loadModule()
    setLocation(ALLOWED_HOST)

    expect(() => trackPageview('/a')).not.toThrow()
    expect(() => trackPageview('/b')).not.toThrow()
  })

  describe('metadata of a held first page (AC-2, amended 2026-10-18)', () => {
    it('keeps the first page title and query when navigation without a query happens before load', async () => {
      const { trackPageview } = await loadModule()
      setLocation(ALLOWED_HOST)
      Object.defineProperty(document, 'referrer', { value: 'https://linkedin.example/', configurable: true })
      const script = addVendorScript()
      const seen: Array<{ vars: Vars; search: string; title: string; referrer: string }> = []
      document.title = 'A'
      trackPageview('/a')
      document.title = 'B'
      trackPageview('/b')

      setVendorCount((vars) => {
        seen.push({ vars, search: location.search, title: document.title, referrer: document.referrer })
      })
      script.dispatchEvent(new Event('load'))

      expect(seen).toEqual([
        { vars: { path: '/a', title: 'A' }, search: '', title: 'B', referrer: 'https://linkedin.example/' },
      ])
      delete (document as { referrer?: string }).referrer
    })

    it('sends nothing for the held page when the query changed, then counts the next navigation', async () => {
      const { trackPageview } = await loadModule()
      setLocation(ALLOWED_HOST, '')
      const script = addVendorScript()
      document.title = 'A'
      trackPageview('/a')
      setLocation(ALLOWED_HOST, '?campaign=x')
      document.title = 'B'
      trackPageview('/b')

      const count = vi.fn()
      setVendorCount(count)
      script.dispatchEvent(new Event('load'))
      expect(count).not.toHaveBeenCalled()

      document.title = 'C'
      setLocation(ALLOWED_HOST, '')
      trackPageview('/c')
      expect(count).toHaveBeenCalledTimes(1)
      expect(count).toHaveBeenCalledWith({ path: '/c', title: 'C' })
    })

    it('sends a landing page with its own query when nothing else happened', async () => {
      const { trackPageview } = await loadModule()
      setLocation(ALLOWED_HOST, '?ref=x')
      const script = addVendorScript()
      document.title = 'A'
      trackPageview('/a')

      const seen: Array<{ vars: Vars; search: string }> = []
      setVendorCount((vars) => seen.push({ vars, search: location.search }))
      script.dispatchEvent(new Event('load'))

      expect(seen).toEqual([{ vars: { path: '/a', title: 'A' }, search: '?ref=x' }])
    })

    it('does not refresh the snapshot when the title changes before load', async () => {
      const { trackPageview } = await loadModule()
      setLocation(ALLOWED_HOST)
      const script = addVendorScript()
      document.title = 'A'
      trackPageview('/a')
      document.title = 'Z'

      const count = vi.fn()
      setVendorCount(count)
      script.dispatchEvent(new Event('load'))

      expect(count).toHaveBeenCalledWith({ path: '/a', title: 'A' })
    })
  })
})

describe('ANALYTICS_BOOTSTRAP_SCRIPT', () => {
  function runBootstrap() {
    new Function(ANALYTICS_BOOTSTRAP_SCRIPT)()
  }

  it('creates the config before the vendor script is attached, on the allowed host', () => {
    setLocation(ALLOWED_HOST)
    let noOnloadAtAppend: boolean | undefined
    const append = document.head.appendChild.bind(document.head)
    vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      noOnloadAtAppend = (window as GoatCounterWindow).goatcounter?.no_onload
      return append(node)
    })

    runBootstrap()

    expect(noOnloadAtAppend).toBe(true)
    const scripts = document.head.querySelectorAll<HTMLScriptElement>('script[data-goatcounter]')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].async).toBe(true)
    expect(scripts[0].src).toBe('https://gc.zgo.at/count.js')
    expect(scripts[0].getAttribute('data-goatcounter')).toBe('https://hrqhm.goatcounter.com/count')
  })

  it.each(DENIED_HOSTS)('injects nothing and defines no config on %s', (host) => {
    setLocation(host)

    runBootstrap()

    expect(document.head.querySelector('script[data-goatcounter]')).toBeNull()
    expect((window as GoatCounterWindow).goatcounter).toBeUndefined()
  })
})
