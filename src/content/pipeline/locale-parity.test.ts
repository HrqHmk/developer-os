import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { assertLocaleParity } from './locale-parity'
import { buildArticles, buildLocalizedArticles } from './build-articles'
import { buildLocalizedProjects } from './build-projects'
import { buildLocalizedChangelog } from './build-changelog'
import { discoverEntries } from './discovery'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__')

type Entry = { slug: string; date: string }

describe('assertLocaleParity', () => {
  const english: Entry[] = [
    { slug: 'a', date: '2026-01-01' },
    { slug: 'b', date: '2026-01-02' },
  ]

  it('accepts the same slugs with identical invariant fields', () => {
    expect(() => assertLocaleParity('Test', english, [...english].reverse(), ['date'])).not.toThrow()
  })

  it('names every English entry that has no PT-BR translation', () => {
    expect(() => assertLocaleParity('Test', english, [], ['date'])).toThrow(
      'Test: missing PT-BR translation for: a, b',
    )
  })

  it('rejects a PT-BR entry with no English original', () => {
    expect(() =>
      assertLocaleParity('Test', english, [...english, { slug: 'c', date: '2026-01-03' }], ['date']),
    ).toThrow('PT-BR entries without an English original: c')
  })

  it('rejects a translation whose invariant field differs from the original', () => {
    expect(() =>
      assertLocaleParity('Test', english, [english[0], { slug: 'b', date: '2026-01-03' }], ['date']),
    ).toThrow('Test: fields that must be identical in both languages differ: b.date')
  })

  it('compares array fields by value, not by reference', () => {
    const withList = [{ slug: 'a', list: ['x', 'y'] }]
    expect(() => assertLocaleParity('Test', withList, [{ slug: 'a', list: ['x', 'y'] }], ['list'])).not.toThrow()
    expect(() => assertLocaleParity('Test', withList, [{ slug: 'a', list: ['y', 'x'] }], ['list'])).toThrow()
  })
})

describe('locale-aware discovery and builds', () => {
  it('discovers the PT-BR file only when asked for it, keeping index.md as the default', () => {
    const dir = join(fixturesDir, 'localized-articles', 'valid')
    expect(discoverEntries(dir).every((entry) => entry.filePath.endsWith('index.md'))).toBe(true)
    expect(
      discoverEntries(dir, 'index.pt-br.md').every((entry) => entry.filePath.endsWith('index.pt-br.md')),
    ).toBe(true)
  })

  it('builds each language from its own file in the same entry directory', () => {
    const dir = join(fixturesDir, 'localized-articles', 'valid')
    expect(buildArticles(dir).map((a) => a.title)).toEqual(['First Article', 'Second Article'])
    expect(buildArticles(dir, 'pt-br').map((a) => a.title)).toEqual(['Primeiro Artigo', 'Segundo Artigo'])
  })

  it('returns both article snapshots, in the same order, when parity holds', () => {
    const articles = buildLocalizedArticles(join(fixturesDir, 'localized-articles', 'valid'))
    expect(articles.en.map((a) => a.slug)).toEqual(['first-article', 'second-article'])
    expect(articles['pt-br'].map((a) => a.slug)).toEqual(['first-article', 'second-article'])
    expect(articles['pt-br'][0].html).toContain('Corpo em português.')
  })

  it('fails the article build when an article has no translation', () => {
    expect(() => buildLocalizedArticles(join(fixturesDir, 'localized-articles', 'missing-translation'))).toThrow(
      'Article: missing PT-BR translation for: untranslated',
    )
  })

  it('fails the article build when a translation has no English original', () => {
    expect(() => buildLocalizedArticles(join(fixturesDir, 'localized-articles', 'orphan-translation'))).toThrow(
      'PT-BR entries without an English original: orphan',
    )
  })

  it('fails the article build when a translation has drifted publishedAt', () => {
    expect(() => buildLocalizedArticles(join(fixturesDir, 'localized-articles', 'date-mismatch'))).toThrow(
      'drifted.publishedAt',
    )
  })

  it('builds both project snapshots and rejects drifted technologies', () => {
    const projects = buildLocalizedProjects(join(fixturesDir, 'localized-projects', 'valid'))
    expect(projects['pt-br'][0].title).toBe('Projeto de Exemplo')
    expect(projects['pt-br'][0].technologies).toEqual(projects.en[0].technologies)
    expect(() =>
      buildLocalizedProjects(join(fixturesDir, 'localized-projects', 'technologies-mismatch')),
    ).toThrow('sample-project.technologies')
  })

  it('builds both changelog snapshots and rejects a missing translation', () => {
    const entries = buildLocalizedChangelog(join(fixturesDir, 'localized-changelog', 'valid'))
    expect(entries['pt-br'][0].title).toBe('Blog v1 Publicado')
    expect(() =>
      buildLocalizedChangelog(join(fixturesDir, 'localized-changelog', 'missing-translation')),
    ).toThrow('Changelog: missing PT-BR translation for: blog-v1')
  })
})
