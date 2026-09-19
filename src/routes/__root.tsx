import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Outlet, createRootRoute, HeadContent, Scripts, useRouter } from '@tanstack/react-router'
import appCss from '../styles/app.css?url'
import { GOATCOUNTER_BOOTSTRAP_SCRIPT, startPageviewTracking } from '../integrations/analytics'
import { THEME_BOOTSTRAP_SCRIPT } from '../lib/theme'
import { FloatingThemeControl } from '../components/theme-control'

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
      { rel: 'stylesheet', href: appCss },
      { rel: 'alternate', type: 'application/rss+xml', href: '/rss.xml' },
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
  const router = useRouter()

  // The root knows the router; the analytics boundary knows the vendor;
  // neither learns the other. This is the whole adapter between them.
  useEffect(
    () =>
      startPageviewTracking(router.state.location.pathname, (onPath) =>
        router.subscribe('onResolved', ({ toLocation, pathChanged }) => {
          if (pathChanged) onPath(toLocation.pathname)
        }),
      ),
    [router],
  )

  return (
    // The pre-paint theme bootstrap below mutates this element's `class`
    // before hydration runs, so React's server-rendered class intentionally
    // does not match the DOM's — see Issue #44 (Dark Mode v1).
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        {/* Analytics (Issue #52): config, then the async vendor script — one script, so the order is guaranteed. */}
        <script dangerouslySetInnerHTML={{ __html: GOATCOUNTER_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="bg-background font-sans text-foreground">
        <FloatingThemeControl />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
