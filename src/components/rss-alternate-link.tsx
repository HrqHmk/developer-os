import { useRouterState } from '@tanstack/react-router'
import { localeFromPathname } from '../lib/locale'

/**
 * Advertises the RSS feed — English pages only (Issue #83 scope decision).
 * The feed is English and there is no PT-BR feed, so PT-BR pages do not
 * present it as part of their experience. Rendered by `__root.tsx` inside
 * `<head>`, decided from the URL like `<html lang>`, so it covers every
 * English route, not-found included, exactly as the root `head()` did before.
 */
export function RssAlternateLink() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  if (localeFromPathname(pathname) !== 'en') return null

  return <link rel="alternate" type="application/rss+xml" href="/rss.xml" />
}
