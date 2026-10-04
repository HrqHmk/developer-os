import { describe, expect, it } from 'vitest'
import { CANONICAL_ORIGIN, homeHead, homeHeadFor, languageAlternateLinks, pageHead } from './site-metadata'

type MetaEntry = { name?: string; property?: string; content: string }

const metaEntries: MetaEntry[] = homeHead.meta

function metaContent(key: 'name' | 'property', value: string): string | undefined {
  return metaEntries.find((entry) => entry[key] === value)?.content
}

describe('homeHead', () => {
  it('declares every required tag', () => {
    expect(metaContent('name', 'description')).toBeTruthy()
    for (const property of [
      'og:title',
      'og:description',
      'og:type',
      'og:url',
      'og:image',
      'og:image:width',
      'og:image:height',
      'og:image:alt',
      'og:site_name',
    ]) {
      expect(metaContent('property', property), property).toBeTruthy()
    }
    for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
      expect(metaContent('name', name), name).toBeTruthy()
    }
    expect(homeHead.links.filter((link) => link.rel === 'canonical')).toHaveLength(1)
  })

  it('uses exactly the canonical origin, without a trailing slash, for og:url and canonical', () => {
    expect(CANONICAL_ORIGIN).toBe('https://developeros.dev')
    expect(metaContent('property', 'og:url')).toBe('https://developeros.dev')
    expect(homeHead.links.find((link) => link.rel === 'canonical')?.href).toBe(
      'https://developeros.dev',
    )
  })

  it('points og:image and twitter:image to an absolute URL on the canonical origin', () => {
    const ogImage = metaContent('property', 'og:image')
    expect(ogImage?.startsWith(`${CANONICAL_ORIGIN}/`)).toBe(true)
    expect(() => new URL(ogImage as string)).not.toThrow()
    expect(metaContent('name', 'twitter:image')).toBe(ogImage)
  })

  it('uses the summary_large_image Twitter card', () => {
    expect(metaContent('name', 'twitter:card')).toBe('summary_large_image')
  })

  it('keeps the Twitter copy identical to the Open Graph copy', () => {
    expect(metaContent('name', 'twitter:title')).toBe(metaContent('property', 'og:title'))
    expect(metaContent('name', 'twitter:description')).toBe(
      metaContent('property', 'og:description'),
    )
  })

  it('does not emit a title descriptor', () => {
    expect(metaEntries.some((entry) => 'title' in entry)).toBe(false)
  })
})

describe('homeHeadFor (Issue #83)', () => {
  const ptBr = homeHeadFor('pt-br')
  const content = (key: 'name' | 'property', value: string, head = ptBr) =>
    (head.meta as MetaEntry[]).find((entry) => entry[key] === value)?.content

  it('keeps the English homepage head identical to `homeHead`', () => {
    expect(homeHeadFor('en')).toEqual(homeHead)
  })

  it('declares each home page language for Open Graph', () => {
    expect(content('property', 'og:locale', homeHead)).toBe('en_US')
    expect(content('property', 'og:locale:alternate', homeHead)).toBe('pt_BR')
    expect(content('property', 'og:locale')).toBe('pt_BR')
    expect(content('property', 'og:locale:alternate')).toBe('en_US')
  })

  it('points the PT-BR canonical and og:url to /pt-br', () => {
    expect(content('property', 'og:url')).toBe('https://developeros.dev/pt-br')
    expect(ptBr.links.find((link) => link.rel === 'canonical')?.href).toBe(
      'https://developeros.dev/pt-br',
    )
  })

  it('translates the PT-BR description and social copy, keeping the shared OG image', () => {
    expect(content('name', 'description')).not.toBe(content('name', 'description', homeHead))
    expect(content('property', 'og:title')).toBe('Developer OS — Engenharia em Público')
    expect(content('name', 'twitter:title')).toBe(content('property', 'og:title'))
    expect(content('property', 'og:image')).toBe(content('property', 'og:image', homeHead))
  })
})

describe('languageAlternateLinks (Issue #83)', () => {
  it('declares the English page, its PT-BR equivalent and English as x-default', () => {
    expect(languageAlternateLinks('/blog/a-slug')).toEqual([
      { rel: 'alternate', hrefLang: 'en', href: 'https://developeros.dev/blog/a-slug' },
      { rel: 'alternate', hrefLang: 'pt-BR', href: 'https://developeros.dev/pt-br/blog/a-slug' },
      { rel: 'alternate', hrefLang: 'x-default', href: 'https://developeros.dev/blog/a-slug' },
    ])
  })

  it('uses the bare origin for the English home, like the canonical', () => {
    expect(languageAlternateLinks('/').map((link) => link.href)).toEqual([
      'https://developeros.dev',
      'https://developeros.dev/pt-br',
      'https://developeros.dev',
    ])
  })
})

describe('pageHead (Issue #83)', () => {
  it('emits a description only when the page has one', () => {
    expect(pageHead('/about', 'About Developer OS').meta).toEqual([{ title: 'About Developer OS' }])
    expect(pageHead('/projects/x', 'X — Developer OS', 'A project.').meta).toEqual([
      { title: 'X — Developer OS' },
      { name: 'description', content: 'A project.' },
    ])
  })
})
