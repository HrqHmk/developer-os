import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildArticles } from './build-articles'
import { buildProjects } from './build-projects'
import { buildSearchIndex } from './search-index'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__')

/**
 * Built from the on-disk fixtures rather than from hand-written objects:
 * this exercises the real path a document travels — Markdown, `toHtml()`,
 * `htmlToPlainText()` — which is the wiring the index depends on and the
 * part a literal would quietly skip (conventions.md §12.3).
 */
function indexFromFixtures() {
  return buildSearchIndex(
    buildArticles(join(fixturesDir, 'valid-articles')),
    buildProjects(join(fixturesDir, 'valid-projects')),
  )
}

describe('buildSearchIndex', () => {
  it('emits one document per entry, articles first, each typed and keyed by slug', () => {
    const index = indexFromFixtures()

    expect(index.map((document) => [document.type, document.slug])).toEqual([
      // Articles keep buildArticles' `publishedAt` descending order...
      ['article', 'why-example'],
      ['article', 'another-example'],
      // ...and projects follow, in discovery order.
      ['project', 'sample-project'],
    ])
  })

  it('copies title and description verbatim', () => {
    const [article] = indexFromFixtures()

    expect(article.title).toBe('Why Example')
    expect(article.description).toBe(
      'A valid fixture article used to verify the pipeline end to end.',
    )
  })

  it('derives the body as the readable plain text of the compiled Markdown', () => {
    const index = indexFromFixtures()

    expect(index[0].body).toBe(
      'Heading A paragraph with bold text and a link. plain fenced code block',
    )
    expect(index[2].body).toBe(
      'Architecture Body content used only to verify Markdown-to-HTML composition.',
    )
  })

  it('leaks no markup into the body', () => {
    // Deliberately specific rather than asserting the body holds no `<` or
    // `>`: both are legitimate authored characters (`1 > 0` in a code block,
    // `a > b` in an image alt), so a blanket rule would forbid real content.
    for (const { body } of indexFromFixtures()) {
      expect(body).not.toContain('<p')
      expect(body).not.toContain('</')
      expect(body).not.toContain('href=')
      expect(body).not.toContain('class=')
      expect(body).not.toContain('src=')
    }
    expect(indexFromFixtures()[0].body).not.toContain('https://example.com')
  })

  it('exposes exactly the searchable fields, and nothing else', () => {
    // Search v1 indexes title, description and body only, so a project's
    // `technologies` and an article's `publishedAt` must not reach the
    // index — nor must the compiled `html` (Issue #48).
    for (const document of indexFromFixtures()) {
      expect(Object.keys(document).sort()).toEqual([
        'body',
        'description',
        'slug',
        'title',
        'type',
      ])
    }
  })

  it('returns an empty index for empty snapshots', () => {
    expect(buildSearchIndex([], [])).toEqual([])
  })
})
