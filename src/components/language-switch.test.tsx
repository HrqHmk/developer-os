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
import { NotFoundPage } from './not-found-page'
import { RssAlternateLink } from './rss-alternate-link'

/**
 * Mirrors what `__root.tsx` and the two home routes render (Issue #83):
 * `FloatingThemeControl` and the RSS link at the root, `HomeHeader` on `/`
 * and `/pt-br`, and the router-level not-found component. `__root.tsx`
 * renders `<html>` and cannot be mounted in jsdom, so this harness reproduces
 * its composition, as `theme-control.test.tsx` does. React 19 hoists the RSS
 * `<link>` into `document.head` wherever it is rendered, so it is queried
 * there.
 *
 * Stub routes exist only so `<Link>` can resolve its targets.
 */
function renderAt(initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <RssAlternateLink />
        <FloatingThemeControl />
        <Outlet />
      </>
    ),
  })

  const stubPaths = ['/about', '/projects', '/blog', '/learning', '/search', '/blog/$slug']
  const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => <HomeHeader /> }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/pt-br',
      component: () => <HomeHeader locale="pt-br" />,
    }),
    ...stubPaths.flatMap((path) => [
      createRoute({ getParentRoute: () => rootRoute, path, component: () => null }),
      createRoute({ getParentRoute: () => rootRoute, path: `/pt-br${path}`, component: () => null }),
    ]),
  ])

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

describe('LanguageSwitch', () => {
  it('links an English page to the same page in PT-BR, named in Portuguese', async () => {
    renderAt('/about')

    const link = await screen.findByRole('link', { name: 'Português' })
    expect(link.getAttribute('href')).toBe('/pt-br/about')
    expect(link.getAttribute('hreflang')).toBe('pt-BR')
    expect(link.getAttribute('lang')).toBe('pt-BR')
  })

  it('links a PT-BR page back to the same page in English, named in English', async () => {
    renderAt('/pt-br/blog/some-article')

    const link = await screen.findByRole('link', { name: 'English' })
    expect(link.getAttribute('href')).toBe('/blog/some-article')
    expect(link.getAttribute('hreflang')).toBe('en')
    expect(link.getAttribute('lang')).toBe('en')
  })

  it('links the two home pages to each other', async () => {
    renderAt('/')
    expect((await screen.findByRole('link', { name: 'Português' })).getAttribute('href')).toBe('/pt-br')
    cleanup()

    renderAt('/pt-br')
    expect((await screen.findByRole('link', { name: 'English' })).getAttribute('href')).toBe('/')
  })

  it('sits right before the theme selector and is reached by Tab on an internal page', async () => {
    const { user } = renderAt('/pt-br/about')
    const link = await screen.findByRole('link', { name: 'English' })
    const theme = screen.getByRole('combobox', { name: 'Tema' })

    expect(link.compareDocumentPosition(theme) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    await user.tab()
    expect(document.activeElement).toBe(link)
    await user.tab()
    expect(document.activeElement).toBe(theme)
  })
})

describe('PT-BR home header', () => {
  it('renders exactly one theme control, in the header, in Portuguese', async () => {
    renderAt('/pt-br')

    const banner = within(await screen.findByRole('banner'))
    expect(screen.getAllByRole('combobox')).toHaveLength(1)
    expect(banner.getByRole('combobox', { name: 'Tema' })).toBeDefined()
    expect(banner.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Sistema',
      'Claro',
      'Escuro',
    ])
  })

  it('keeps the same five destinations, in the same order, under /pt-br', async () => {
    renderAt('/pt-br')

    const nav = within(await screen.findByRole('navigation', { name: 'Principal' }))
    const links = nav.getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'Projetos',
      'Blog',
      'Aprendizado',
      'Sobre',
      'Busca',
    ])
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/pt-br/projects',
      '/pt-br/blog',
      '/pt-br/learning',
      '/pt-br/about',
      '/pt-br/search',
    ])
    expect(screen.getByRole('link', { name: 'Developer OS' }).getAttribute('href')).toBe('/pt-br')
  })

  it('keeps the language switch outside the Primary nav, before the theme selector', async () => {
    renderAt('/')

    const nav = await screen.findByRole('navigation', { name: 'Primary' })
    const banner = within(screen.getByRole('banner'))
    const link = banner.getByRole('link', { name: 'Português' })

    expect(nav.contains(link)).toBe(false)
    expect(
      link.compareDocumentPosition(banner.getByRole('combobox', { name: 'Theme' })) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})

describe('RssAlternateLink', () => {
  const feedLinks = () =>
    document.querySelectorAll('link[rel="alternate"][type="application/rss+xml"]')

  it('advertises the English feed on English pages', async () => {
    renderAt('/about')
    await screen.findByRole('link', { name: 'Português' })

    const links = feedLinks()
    expect(links).toHaveLength(1)
    expect(links[0].getAttribute('href')).toBe('/rss.xml')
  })

  it('advertises no feed on PT-BR pages', async () => {
    renderAt('/pt-br/about')
    await screen.findByRole('link', { name: 'English' })

    expect(feedLinks()).toHaveLength(0)
  })
})

describe('NotFoundPage', () => {
  it('keeps the English message for an unknown English path', async () => {
    renderAt('/nonexistent')
    expect(await screen.findByText('Not Found')).toBeDefined()
  })

  it('answers in Portuguese for an unknown PT-BR path', async () => {
    renderAt('/pt-br/nonexistent')
    expect(await screen.findByText('Página não encontrada')).toBeDefined()
    expect(screen.queryByText('Not Found')).toBeNull()
  })
})
