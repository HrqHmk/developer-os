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
import { NotFoundPage } from './not-found-page'
import { SiteFooter } from './site-footer'

/**
 * Mirrors the body of `__root.tsx` (Issue #95): the floating control, the
 * page, then `SiteFooter`, with the router-level not-found component — as
 * `language-switch.test.tsx` does, since `__root.tsx` renders `<html>` and
 * cannot be mounted in jsdom. Stub pages render a `<main>` so the footer can
 * be checked to sit outside it.
 */
function renderAt(initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <FloatingThemeControl />
        <Outlet />
        <SiteFooter />
      </>
    ),
  })

  const stubPaths = ['/', '/about', '/privacy']
  const routeTree = rootRoute.addChildren(
    stubPaths.flatMap((path) => [
      createRoute({ getParentRoute: () => rootRoute, path, component: () => <main>page</main> }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: path === '/' ? '/pt-br' : `/pt-br${path}`,
        component: () => <main>page</main>,
      }),
    ]),
  )

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    defaultNotFoundComponent: NotFoundPage,
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

const EXPECTED = {
  en: {
    notice: 'This site uses GoatCounter for aggregate visit statistics.',
    privacy: 'Privacy',
    privacyHref: '/privacy',
  },
  'pt-br': {
    notice: 'Este site usa o GoatCounter para estatísticas agregadas de visitas.',
    privacy: 'Privacidade',
    privacyHref: '/pt-br/privacy',
  },
}

const CASES = [
  { path: '/', locale: 'en' },
  { path: '/about', locale: 'en' },
  { path: '/nonexistent', locale: 'en' },
  { path: '/pt-br', locale: 'pt-br' },
  { path: '/pt-br/about', locale: 'pt-br' },
  { path: '/pt-br/nonexistent', locale: 'pt-br' },
] as const

describe('SiteFooter', () => {
  it.each(CASES)('renders one localized footer on $path', async ({ path, locale }) => {
    renderAt(path)
    const expected = EXPECTED[locale]

    const footer = await screen.findByRole('contentinfo')
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(within(footer).getByText(expected.notice)).toBeDefined()
    expect(within(footer).getByRole('link', { name: expected.privacy }).getAttribute('href')).toBe(
      expected.privacyHref,
    )
    expect(
      within(footer).getByRole('link', { name: 'hello@developeros.dev' }).getAttribute('href'),
    ).toBe('mailto:hello@developeros.dev')
  })

  it('sits outside the page main', async () => {
    renderAt('/about')
    const footer = await screen.findByRole('contentinfo')

    expect(screen.getByRole('main').contains(footer)).toBe(false)
  })

  it('is reached by Tab after the top controls, privacy link first', async () => {
    const { user } = renderAt('/pt-br/about')
    const footer = within(await screen.findByRole('contentinfo'))

    await user.tab() // language switch
    await user.tab() // theme selector
    await user.tab()
    expect(document.activeElement).toBe(footer.getByRole('link', { name: 'Privacidade' }))
    await user.tab()
    expect(document.activeElement).toBe(footer.getByRole('link', { name: 'hello@developeros.dev' }))
  })
})
