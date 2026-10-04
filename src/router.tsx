import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { NotFoundPage } from './components/not-found-page'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    // Covers unknown URLs and `notFound()` thrown by `$slug` loaders alike, in
    // the language of the URL (Issue #83).
    defaultNotFoundComponent: NotFoundPage,
  })
  return router
}
