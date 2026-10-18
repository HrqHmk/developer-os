/**
 * The only module that knows the analytics vendor (GoatCounter) — ADR-0007 A4.
 * Nothing consumes a result from here: replacing `trackPageview` with a no-op
 * and `ANALYTICS_BOOTSTRAP_SCRIPT` with `''` changes no functional behaviour.
 *
 * Collection is restricted to the canonical production host. The static
 * artifact is identical on every host (previews, `www`, local), so the
 * decision is made at runtime, in the browser, in two layers: the bootstrap
 * does not inject the vendor off-host, and `trackPageview` refuses to send.
 * See `docs/conventions.md` §14 and Issue #93.
 */

export const ANALYTICS_HOSTNAME = 'developeros.dev'
const VENDOR_SCRIPT_URL = 'https://gc.zgo.at/count.js'
const VENDOR_ENDPOINT = 'https://hrqhm.goatcounter.com/count'

/**
 * Executed inline in `<head>` — see `RootDocument` (`src/routes/__root.tsx`).
 * The config is created before the vendor script exists, so `no_onload` is
 * always in place when `count.js` runs (it reads it at execution time) and the
 * vendor never records its own automatic pageview. Because the tag is created
 * here instead of rendered by React, its position in the markup is irrelevant.
 * References `location`/`document`/`window` as bare globals so
 * `analytics.test.ts` can execute this exact string and verify the shipped
 * bytes (same approach as `THEME_BOOTSTRAP_SCRIPT`).
 */
export const ANALYTICS_BOOTSTRAP_SCRIPT = `
try {
  if (location.hostname === '${ANALYTICS_HOSTNAME}') {
    window.goatcounter = { no_onload: true };
    var s = document.createElement('script');
    s.async = true;
    s.src = '${VENDOR_SCRIPT_URL}';
    s.setAttribute('data-goatcounter', '${VENDOR_ENDPOINT}');
    document.head.appendChild(s);
  }
} catch (e) {}
`.trim()

type PageviewSnapshot = { path: string; title: string; search: string }

type GoatCounterWindow = Window & {
  goatcounter?: { count?: (vars: { path: string; title: string }) => void }
}

let lastPath: string | null = null
let pending: PageviewSnapshot | null = null

function vendorIsReady(): boolean {
  return typeof (window as GoatCounterWindow).goatcounter?.count === 'function'
}

/**
 * The only place that calls the vendor. The vendor always reads the query from
 * the current `location.search` and cannot be given another one, so a held
 * pageview is sent only while that query is still its own; otherwise it would
 * be attributed to another page's campaign (AC-2, amended 2026-10-18).
 */
function send(snapshot: PageviewSnapshot): void {
  try {
    const count = (window as GoatCounterWindow).goatcounter?.count
    if (typeof count !== 'function') return
    if (window.location.search !== snapshot.search) return
    count({ path: snapshot.path, title: snapshot.title })
  } catch {
    // Measuring must never surface an error (ADR-0007 A5).
  }
}

function flushPendingWhenVendorLoads(): void {
  const script = document.querySelector('script[data-goatcounter]')
  if (!script) return
  script.addEventListener(
    'load',
    () => {
      const held = pending
      pending = null
      if (held) send(held)
    },
    { once: true },
  )
}

/**
 * Records one pageview for a pathname the router has just resolved.
 *
 * The path, title and query are captured at resolution and never refreshed.
 * Before the vendor is ready only the first page is held (one snapshot, no
 * queue, no timer, no retry); later navigations in that window are dropped.
 */
export function trackPageview(pathname: string): void {
  if (typeof window === 'undefined') return
  if (window.location.hostname !== ANALYTICS_HOSTNAME) return
  if (pathname === lastPath) return

  const isFirst = lastPath === null
  lastPath = pathname
  const snapshot: PageviewSnapshot = {
    path: pathname,
    title: document.title,
    search: window.location.search,
  }

  if (vendorIsReady()) {
    send(snapshot)
    return
  }
  if (isFirst) {
    pending = snapshot
    flushPendingWhenVendorLoads()
  }
}
