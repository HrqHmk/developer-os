import { useEffect, type ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouterState,
} from '@tanstack/react-router'
import appCss from '../styles/app.css?url'
import { THEME_BOOTSTRAP_SCRIPT } from '../lib/theme'
import { ANALYTICS_BOOTSTRAP_SCRIPT, trackPageview } from '../integrations/analytics'
import { htmlLang, localeFromPathname } from '../lib/locale'
import { FloatingThemeControl } from '../components/theme-control'
import { RssAlternateLink } from '../components/rss-alternate-link'
import { SiteFooter } from '../components/site-footer'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: 'Developer OS' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  // The URL is the only source of truth for the language (Issue #83): `lang`
  // follows the path, on every route including not-found, and is identical
  // on server and client because both read the same location.
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  // One pageview per resolved pathname (Issue #93): `resolvedLocation` is set
  // on hydration and when a navigation completes, so superseded navigations
  // and query- or hash-only changes never reach the analytics boundary.
  const resolvedPathname = useRouterState({ select: (state) => state.resolvedLocation?.pathname })
  useEffect(() => {
    if (resolvedPathname) trackPageview(resolvedPathname)
  }, [resolvedPathname])

  return (
    // The pre-paint theme bootstrap below mutates this element's `class`
    // before hydration runs, so React's server-rendered class intentionally
    // does not match the DOM's — see Issue #44 (Dark Mode v1). The `data-js`
    // flag set next to it is the same kind of pre-paint mutation: it lets
    // `HomeHeader` collapse its nav only when JavaScript runs (Issue #76).
    <html lang={htmlLang(localeFromPathname(pathname))} suppressHydrationWarning>
      <head>
        <HeadContent />
        <RssAlternateLink />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js', '')" }} />
        <script dangerouslySetInnerHTML={{ __html: ANALYTICS_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="bg-background font-sans text-foreground">
        <FloatingThemeControl />
        {children}
        <SiteFooter />
        <Scripts />
      </body>
    </html>
  )
}
