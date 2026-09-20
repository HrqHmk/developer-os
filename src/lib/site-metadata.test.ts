import { describe, expect, it } from 'vitest'
import { CANONICAL_ORIGIN, homeHead } from './site-metadata'

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
