import type { ReactNode } from 'react'
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import appCss from '../styles/app.css?url'
import { THEME_BOOTSTRAP_SCRIPT } from '../lib/theme'
import { ThemeControl } from '../components/theme-control'

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
  return (
    // The pre-paint theme bootstrap below mutates this element's `class`
    // before hydration runs, so React's server-rendered class intentionally
    // does not match the DOM's — see Issue #44 (Dark Mode v1).
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="bg-background font-sans text-foreground">
        <ThemeControl />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
