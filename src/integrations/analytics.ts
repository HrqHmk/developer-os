/**
 * The single analytics boundary (Issue #52, ADR-0007 A4). Everything that
 * knows the vendor — its name, endpoint, payload shape or script text — lives
 * in this file and nowhere else. Callers speak the project's own vocabulary:
 * a closed set of event names and resolved pathnames.
 *
 * Data flows one way, application → boundary. Nothing in the app reads
 * anything back from here, so removing this module (or making it a no-op)
 * leaves rendering and navigation unchanged (A4), and no function below ever
 * lets a vendor failure escape to its caller (A5).
 */

export type AnalyticsEvent = 'project_external_link_clicked' | 'search_result_clicked'

/**
 * Only the canonical production hostname may emit. Preview deployments are
 * real, non-local `*.workers.dev` URLs the vendor does not filter, so without
 * this guard the author's own work-in-progress traffic would be counted. This
 * is counting correctness, not a feature flag: it never decides whether
 * analytics exists, only which host reports. `www.` is deliberately absent.
 */
const PRODUCTION_HOSTNAME = 'developeros.dev'

/**
 * Fixed, human-readable titles for the two events. A `Record` over the closed
 * union, so a new event name cannot exist without one — and no free text can
 * reach the vendor through an event's name, path or title.
 */
const EVENT_TITLES: Record<AnalyticsEvent, string> = {
  project_external_link_clicked: 'Project external link clicked',
  search_result_clicked: 'Search result clicked',
}

/**
 * Only what this file actually calls. Applied locally at the point of access
 * (see `getVendor`) — never as a `declare global`, which would be an ambient
 * declaration visible to the whole program and would spread vendor knowledge
 * past this file.
 */
type GoatCounterApi = {
  count(vars: { path: string; title?: string; event?: boolean }): void
}

/**
 * The vendor site code. It ships in the HTML of every page, so it is public by
 * construction — not a secret, and therefore not a build variable
 * (ADR-0006 D9 is not triggered).
 */
const GOATCOUNTER_SITE_CODE = 'hrqhm'

const GOATCOUNTER_ENDPOINT = `https://${GOATCOUNTER_SITE_CODE}.goatcounter.com/count`
const GOATCOUNTER_SCRIPT_SRC = '//gc.zgo.at/count.js'

/**
 * Inline script for the document `<head>`: sets the vendor config, and only
 * then adds the vendor script — `async`, so it never blocks rendering.
 *
 * Config and vendor script are one script on purpose. `count.js` reads
 * `no_onload` the moment it runs; if it ran first it would fire its own
 * automatic pageview, and the config assignment that followed would replace
 * `window.goatcounter` and delete the `count` it had just defined. React 19
 * hoists a rendered `<script async src>` to the top of the `<head>`, ahead of
 * any inline script, so two separate tags cannot guarantee the order.
 *
 * `no_onload` suppresses the vendor's automatic pageview: `count.js` counts
 * once per document load and ignores History-API navigation, so this app sends
 * one pageview per resolved path change itself (`startPageviewTracking`), first
 * load included.
 *
 * Exported as a string, like `THEME_BOOTSTRAP_SCRIPT` in `src/lib/theme.ts`,
 * so a test can execute exactly what ships.
 */
export const GOATCOUNTER_BOOTSTRAP_SCRIPT = `
(function () {
  window.goatcounter = { no_onload: true };
  var script = document.createElement('script');
  script.async = true;
  script.setAttribute('data-goatcounter', '${GOATCOUNTER_ENDPOINT}');
  script.src = '${GOATCOUNTER_SCRIPT_SRC}';
  document.head.appendChild(script);
})();
`.trim()

// ---------------------------------------------------------------------------
// Startup coordination
// ---------------------------------------------------------------------------
//
// With `no_onload` active and `count.js` loading `async`, a pageview sent
// before the vendor is ready is lost for good. The state below lives at module
// scope, not in a component: Strict Mode recreates component state but not
// module state, so de-duplication survives mount → cleanup → remount.

/**
 * Pathnames resolved but **not yet sent**, in resolution order. Unbounded on
 * purpose: any cap, eviction or overwrite would discard real navigations by
 * design, which is a change to the product contract and not a detail to
 * reintroduce quietly.
 */
const pendingPaths: string[] = []

/** The last pathname whose vendor call actually returned normally. */
let lastSentPath: string | null = null

/** Whether the one-time `load` listener is already attached. */
let readinessBound = false

// A pathname sitting in `pendingPaths` has not been counted and nothing may
// treat it as counted; that is why the two states are kept apart. "Sent" means
// the vendor call returned normally — the only handoff observable from here,
// since the vendor API is fire-and-forget and offers no network confirmation.

function getVendor(): Partial<GoatCounterApi> | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { goatcounter?: Partial<GoatCounterApi> }).goatcounter
}

function isCountingAllowed(): boolean {
  return typeof window !== 'undefined' && window.location.hostname === PRODUCTION_HOSTNAME
}

/**
 * `window.goatcounter` exists from the moment the inline config runs; its
 * `count` appears only once `count.js` finishes loading. Readiness is
 * therefore tested on the function, never on the object.
 */
function getReadyVendor(): GoatCounterApi | undefined {
  const vendor = getVendor()
  return typeof vendor?.count === 'function' ? (vendor as GoatCounterApi) : undefined
}

/**
 * The only place a vendor call is made, and the containment point: a throwing
 * vendor must never escape into a router callback or a click handler (A5). It
 * wraps the call and nothing else — it never advances state, never queues,
 * never retries. Returns whether the call returned normally.
 */
function sendToVendor(
  vendor: GoatCounterApi,
  vars: Parameters<GoatCounterApi['count']>[0],
): boolean {
  try {
    vendor.count(vars)
    return true
  } catch {
    return false
  }
}

/**
 * Drains the queue one item at a time: peek, send, and only then remove and
 * mark sent. Removing a batch ahead of the sends (`splice`, take-and-clear)
 * would lose the whole remaining queue to a single vendor throw — a discard
 * policy arriving by accident. If a send fails the loop stops there: the
 * failing pathname and everything after it stay pending, in order. Nothing is
 * retried and no timer is scheduled.
 */
function flushPending(): void {
  const vendor = getReadyVendor()
  // The `load` event can fire while the vendor defines nothing (a stub or a
  // broken script). The queue is never consumed by a flush that cannot send.
  if (!vendor) return

  while (pendingPaths.length > 0) {
    const path = pendingPaths[0]
    if (!sendToVendor(vendor, { path })) return
    pendingPaths.shift()
    lastSentPath = path
  }
}

function bindReadinessOnce(): void {
  if (readinessBound) return

  const script = document.querySelector('script[data-goatcounter]')
  // No vendor script in the document means there is nothing to wait for.
  if (!script) return

  readinessBound = true
  script.addEventListener('load', flushPending, { once: true })
}

/**
 * The pathname de-duplication compares against: the tail of the queue while
 * it is non-empty, the last sent pathname otherwise. Comparing with the tail —
 * not the whole queue — keeps `/a → /b → /a` before readiness three
 * resolutions rather than two.
 */
function currentAccountedPath(): string | null {
  return pendingPaths.length > 0 ? pendingPaths[pendingPaths.length - 1] : lastSentPath
}

/**
 * Counts one pageview for a resolved pathname. Steps 3 and 5 run in a single
 * synchronous block and the `load` event is a separate task, so it cannot be
 * delivered between the readiness check and the listener being attached:
 * either `count` already exists (sent now) or the listener will fire later.
 */
export function trackPageview(path: string): void {
  if (!isCountingAllowed()) return
  if (path === currentAccountedPath()) return

  const vendor = getReadyVendor()
  if (vendor) {
    // A throw is contained and the pathname is deliberately not queued:
    // queuing it would be a retry, and no further readiness event exists to
    // act on it.
    if (sendToVendor(vendor, { path })) lastSentPath = path
    return
  }

  pendingPaths.push(path)
  bindReadinessOnce()
}

/**
 * Counts the current pathname on mount and subscribes to later ones, handing
 * the caller's unsubscribe straight back as the effect cleanup. If the router
 * also announces the initial load, `trackPageview` suppresses it as a
 * duplicate; if it never does, the mount-time count already did the work — so
 * correctness does not depend on which behaviour the router has. The router
 * stays outside this file: it arrives as `subscribeToPathChanges`.
 */
export function startPageviewTracking(
  initialPath: string,
  subscribeToPathChanges: (onPath: (path: string) => void) => () => void,
): () => void {
  trackPageview(initialPath)
  return subscribeToPathChanges(trackPageview)
}

/**
 * Sends one of the two approved product events. Event names are fixed and the
 * type has no `string` escape hatch, so free text (a Search query, any typed
 * input) cannot be folded into a name, path or title. Never blocks or delays
 * the caller: synchronous, no `await`, no timer. An event has nowhere to wait
 * — if the vendor is not ready the click is simply not counted (A5, A8).
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!isCountingAllowed()) return

  const vendor = getReadyVendor()
  if (!vendor) return

  sendToVendor(vendor, { path: event, title: EVENT_TITLES[event], event: true })
}

/**
 * Read-only view of the coordination state, for the boundary's own tests. The
 * app never calls it (A4: nothing reads analytics back). It exists because
 * "the failing pathname stays pending" and "nothing was marked sent" are
 * properties of state that no other observable output distinguishes.
 */
export function readCoordinationState(): {
  pending: readonly string[]
  lastSent: string | null
} {
  return { pending: [...pendingPaths], lastSent: lastSentPath }
}
