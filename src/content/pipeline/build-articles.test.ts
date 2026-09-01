import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildArticles } from './build-articles'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('buildArticles', () => {
  it('returns validated, processed articles sorted by publishedAt descending', () => {
    const articles = buildArticles(join(fixturesDir, 'valid-articles'))

    expect(articles.map((a) => a.slug)).toEqual(['why-example', 'another-example'])
    expect(articles[0].title).toBe('Why Example')
    expect(articles[0].html).toContain('<h2>Heading</h2>')
    expect(articles[1].title).toBe('Another Example')
  })

  it('throws when an article is missing a required frontmatter field', () => {
    expect(() => buildArticles(join(fixturesDir, 'invalid-missing-field'))).toThrow()
  })

  it('throws when an article has an unknown frontmatter field', () => {
    expect(() => buildArticles(join(fixturesDir, 'invalid-unknown-field'))).toThrow()
  })

  it('throws when an article body contains raw HTML', () => {
    expect(() => buildArticles(join(fixturesDir, 'invalid-raw-html'))).toThrow(
      /raw html is not allowed/i,
    )
  })

  it('returns an empty array for a directory with no articles', () => {
    expect(buildArticles(join(fixturesDir, 'discovery-sample', 'empty-dir-no-index'))).toEqual([])
  })
})
