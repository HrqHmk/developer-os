// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { FloatingThemeControl } from './theme-control'
import { HomeHeader } from './home-header'

/**
 * Mirrors the composition `__root.tsx` and `index.tsx` actually render:
 * `FloatingThemeControl` at the root, `HomeHeader` (which renders the inline
 * `ThemeControl`) only on `/`. `__root.tsx` itself renders `<html>` and
 * `<Scripts>` and cannot be mounted in jsdom, so this harness reproduces its
 * two-line composition instead of importing it (Implementation Plan v2 §9).
 *
 * Stub routes for every `HomeHeader` nav target: `<Link>` needs them to
 * resolve to generate `href`s and to navigate.
 */
function renderApp(initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <FloatingThemeControl />
        <Outlet />
      </>
    ),
  })

  const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomeHeader }),
    createRoute({ getParentRoute: () => rootRoute, path: '/about', component: () => null }),
    createRoute({ getParentRoute: () => rootRoute, path: '/projects', component: () => null }),
    createRoute({ getParentRoute: () => rootRoute, path: '/blog', component: () => null }),
    createRoute({ getParentRoute: () => rootRoute, path: '/learning', component: () => null }),
    createRoute({ getParentRoute: () => rootRoute, path: '/search', component: () => null }),
  ])

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })

  render(<RouterProvider router={router} />)

  return { user: userEvent.setup() }
}

// jsdom implements neither `matchMedia` nor `scrollTo`, and `ThemeControl`
// calls the former while `system` is selected while the router calls the
// latter on mount — see `search-panel.test.tsx` for the same `scrollTo`
// stub.
beforeAll(() => {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
  window.scrollTo = () => {}
})

afterEach(cleanup)

describe('theme control placement', () => {
  it('renders exactly one theme control inside the header on /', async () => {
    renderApp('/')

    expect(await screen.findAllByRole('combobox', { name: 'Theme' })).toHaveLength(1)

    const banner = within(screen.getByRole('banner'))
    expect(banner.getAllByRole('combobox', { name: 'Theme' })).toHaveLength(1)
  })

  it('renders exactly one theme control, floating, on another route', async () => {
    renderApp('/about')

    const combos = await screen.findAllByRole('combobox', { name: 'Theme' })
    expect(combos).toHaveLength(1)
    expect(screen.queryByRole('banner')).toBeNull()
  })

  it('keeps exactly one instance across a client-side navigation from / to another route', async () => {
    const { user } = renderApp('/')
    await screen.findAllByRole('combobox', { name: 'Theme' })

    await user.click(screen.getByRole('link', { name: 'About' }))

    const combos = await screen.findAllByRole('combobox', { name: 'Theme' })
    expect(combos).toHaveLength(1)
    expect(screen.queryByRole('banner')).toBeNull()
  })
})

describe('HomeHeader primary nav', () => {
  it('contains exactly Projects, Blog, Learning, About and Search, in that order', async () => {
    renderApp('/')

    const nav = within(await screen.findByRole('navigation', { name: 'Primary' }))
    const links = nav.getAllByRole('link')

    expect(links.map((link) => link.textContent)).toEqual([
      'Projects',
      'Blog',
      'Learning',
      'About',
      'Search',
    ])
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/projects',
      '/blog',
      '/learning',
      '/about',
      '/search',
    ])
  })
})
