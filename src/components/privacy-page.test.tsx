// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import type { Locale } from '../lib/locale'
import { PrivacyPage } from './privacy-page'

/** Renders the page under a router so its `<Link>` can resolve. */
async function renderPage(locale: Locale) {
  const rootRoute = createRootRoute()
  const path = locale === 'en' ? '/privacy' : '/pt-br/privacy'
  const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path, component: () => <PrivacyPage locale={locale} /> }),
  ])
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) })

  render(<RouterProvider router={router} />)
  const main = await screen.findByRole('main')

  const structure = {
    paragraphsPerSection: [...main.querySelectorAll('section')].map(
      (section) => section.querySelectorAll('p, li').length,
    ),
    externalLinks: [...main.querySelectorAll('a[href^="https://"]')].map((link) => link.getAttribute('href')),
    mailtoLinks: [...main.querySelectorAll('a[href^="mailto:"]')].map((link) => link.getAttribute('href')),
    lastUpdated: main.querySelector('time')?.getAttribute('dateTime'),
  }
  cleanup()
  return structure
}

beforeAll(() => {
  window.scrollTo = () => {}
})

afterEach(cleanup)

describe('PrivacyPage', () => {
  // ADR-0011 I5: a section, link or date missing in one language is a parity
  // break the type system does not catch (arrays of any length type-check).
  it('has the same structure in English and PT-BR', async () => {
    const en = await renderPage('en')
    const ptBr = await renderPage('pt-br')

    expect(ptBr).toEqual(en)
  })

  it('links the three official provider policies and the contact address', async () => {
    const en = await renderPage('en')

    expect(en.externalLinks).toEqual([
      'https://www.goatcounter.com/help/privacy',
      'https://buttondown.com/legal/privacy',
      'https://www.cloudflare.com/privacypolicy/',
    ])
    expect(en.mailtoLinks.length).toBeGreaterThan(0)
    expect(new Set(en.mailtoLinks)).toEqual(new Set(['mailto:hello@developeros.dev']))
    expect(en.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
