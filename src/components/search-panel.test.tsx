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
import type { SearchDocument } from '../content/pipeline/search-index'
import { SearchPanel } from './search-panel'

/**
 * An article and a project that both match the same query, so one search
 * renders both kinds at once and a swapped destination is observable.
 */
const documents: SearchDocument[] = [
  {
    type: 'article',
    slug: 'why-developer-os',
    title: 'Why Developer OS',
    description: 'The article description.',
    body: 'orchestration',
  },
  {
    type: 'project',
    slug: 'developer-os',
    title: 'Developer OS Platform',
    description: 'The project description.',
    body: 'platform internals',
  },
]

/**
 * `<Link>` reads the router off React context and dereferences it
 * immediately, so it cannot render outside a provider. This harness exists
 * to supply that context — the stub `$slug` routes are only there for link
 * targets to resolve. Nothing here asserts router behaviour.
 */
function renderSearchPanel() {
  const rootRoute = createRootRoute({ component: () => <Outlet /> })
  const routeTree = rootRoute.addChildren([
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => <SearchPanel documents={documents} />,
    }),
    createRoute({ getParentRoute: () => rootRoute, path: '/blog/$slug', component: () => null }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: '/projects/$slug',
      component: () => null,
    }),
  ])

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  render(<RouterProvider router={router} />)

  return { user: userEvent.setup() }
}

/** The result entry owning this title — the anchor for scoped assertions. */
function resultFor(title: string): HTMLElement {
  const item = screen.getByRole('heading', { name: title }).closest('li')
  if (!item) throw new Error(`No result entry found for "${title}"`)
  return item
}

// jsdom implements no `scrollTo`, and the router calls it when it mounts.
// Stubbing keeps the suite output readable; nothing under test reads it.
beforeAll(() => {
  window.scrollTo = () => {}
})

// With `globals: false`, Testing Library does not register its own cleanup.
afterEach(cleanup)

describe('SearchPanel', () => {
  it('labels the search input accessibly', async () => {
    renderSearchPanel()

    expect(
      await screen.findByRole('searchbox', { name: 'Search Blog articles and Projects' }),
    ).toBeDefined()
  })

  it('shows the hint and no results list before anything is typed', async () => {
    renderSearchPanel()

    expect(
      await screen.findByText('Type to search Blog articles and Projects.'),
    ).toBeDefined()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('shows an explicit no-results state and no list for a query that matches nothing', async () => {
    const { user } = renderSearchPanel()
    await user.type(await screen.findByRole('searchbox'), 'absent')

    expect(screen.getByText('No results for “absent”.')).toBeDefined()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('returns to the initial state when the query is cleared', async () => {
    const { user } = renderSearchPanel()
    const input = await screen.findByRole('searchbox')

    await user.type(input, 'developer')
    expect(screen.getByRole('list')).toBeDefined()

    await user.clear(input)
    expect(screen.getByText('Type to search Blog articles and Projects.')).toBeDefined()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('renders each result with its own description, label and destination', async () => {
    // Scoped per entry on purpose: asserting titles, labels and hrefs
    // independently would pass even if the article pointed at the project's
    // URL. Each assertion below is made inside the entry it belongs to.
    const { user } = renderSearchPanel()
    await user.type(await screen.findByRole('searchbox'), 'developer')

    const article = within(resultFor('Why Developer OS'))
    expect(article.getByText('The article description.')).toBeDefined()
    expect(article.getByText('Blog')).toBeDefined()
    expect(article.getByRole('link').getAttribute('href')).toBe('/blog/why-developer-os')

    const project = within(resultFor('Developer OS Platform'))
    expect(project.getByText('The project description.')).toBeDefined()
    expect(project.getByText('Project')).toBeDefined()
    expect(project.getByRole('link').getAttribute('href')).toBe('/projects/developer-os')
  })

  it('links an article to /blog and a project to /projects, never the other way round', async () => {
    // The swap case, stated on its own: if the two branches in
    // SearchPanel were exchanged, this is the test that fails.
    const { user } = renderSearchPanel()
    await user.type(await screen.findByRole('searchbox'), 'developer')

    const articleHref = within(resultFor('Why Developer OS'))
      .getByRole('link')
      .getAttribute('href')
    const projectHref = within(resultFor('Developer OS Platform'))
      .getByRole('link')
      .getAttribute('href')

    expect(articleHref).toMatch(/^\/blog\//)
    expect(projectHref).toMatch(/^\/projects\//)
  })
})
