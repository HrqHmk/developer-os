// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { HomeHeader } from './home-header'

/**
 * Covers the menu toggle's behavior: its state, its ARIA wiring, Escape and
 * focus return. jsdom loads no CSS, so whether the nav is actually hidden
 * below `md` (and shown without JavaScript) is not observable here — that is
 * covered by visual evidence on the PR, not asserted through class names.
 *
 * Stub routes for every nav target: `<Link>` needs them to resolve `href`s
 * and to navigate (same harness shape as `theme-control.test.tsx`).
 */
function renderHome() {
  const rootRoute = createRootRoute()
  const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomeHeader }),
    ...['/projects', '/blog', '/learning', '/about', '/search'].map((path) =>
      createRoute({ getParentRoute: () => rootRoute, path, component: () => null }),
    ),
  ])

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  render(<RouterProvider router={router} />)

  return { user: userEvent.setup() }
}

// jsdom implements neither `matchMedia` (called by `ThemeControl`) nor
// `scrollTo` (called by the router on mount).
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

describe('HomeHeader menu toggle', () => {
  it('is a button named "Menu", collapsed, controlling the Primary nav', async () => {
    renderHome()

    const toggle = await screen.findByRole('button', { name: 'Menu' })
    const nav = screen.getByRole('navigation', { name: 'Primary' })

    expect(toggle).toHaveProperty('type', 'button')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(nav.id).not.toBe('')
    expect(toggle.getAttribute('aria-controls')).toBe(nav.id)
  })

  it('opens and closes on click', async () => {
    const { user } = renderHome()
    const toggle = await screen.findByRole('button', { name: 'Menu' })

    await user.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')

    await user.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('closes on Escape from inside the nav and returns focus to the toggle', async () => {
    const { user } = renderHome()
    const toggle = await screen.findByRole('button', { name: 'Menu' })

    await user.click(toggle)
    screen.getByRole('link', { name: 'Learning' }).focus()
    await user.keyboard('{Escape}')

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle)
  })

  it('closes on Escape from the toggle itself, keeping focus on it', async () => {
    const { user } = renderHome()
    const toggle = await screen.findByRole('button', { name: 'Menu' })

    await user.click(toggle)
    await user.keyboard('{Escape}')

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle)
  })

  it('ignores Escape from the theme control', async () => {
    const { user } = renderHome()
    const toggle = await screen.findByRole('button', { name: 'Menu' })
    const themeControl = screen.getByRole('combobox', { name: 'Theme' })

    await user.click(toggle)
    themeControl.focus()
    await user.keyboard('{Escape}')

    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(themeControl)
  })

  it('leaves the page, header included, when a link is followed from the open menu', async () => {
    const { user } = renderHome()
    const toggle = await screen.findByRole('button', { name: 'Menu' })

    await user.click(toggle)
    await user.click(screen.getByRole('link', { name: 'About' }))

    await waitFor(() => expect(screen.queryByRole('banner')).toBeNull())
    expect(screen.queryByRole('button', { name: 'Menu' })).toBeNull()
  })
})
