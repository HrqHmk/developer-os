import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildChangelog } from './build-changelog'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('buildChangelog', () => {
  it('returns validated, processed entries sorted by date descending', () => {
    const entries = buildChangelog(join(fixturesDir, 'valid-changelog'))

    expect(entries.map((e) => e.slug)).toEqual(['architecture-v1', 'blog-v1'])
    expect(entries[0].title).toBe('Architecture v1 Shipped')
    expect(entries[0].html).toContain('<h2>Heading</h2>')
    expect(entries[1].title).toBe('Blog v1 Shipped')
    expect(typeof entries[0].date).toBe('string')
  })

  it('throws when an entry is missing a required frontmatter field', () => {
    expect(() => buildChangelog(join(fixturesDir, 'invalid-changelog', 'missing-field'))).toThrow()
  })

  it('throws when an entry has an unknown frontmatter field', () => {
    expect(() => buildChangelog(join(fixturesDir, 'invalid-changelog', 'unknown-field'))).toThrow()
  })

  it('returns an empty array for a directory with no entries', () => {
    expect(buildChangelog(join(fixturesDir, 'discovery-sample', 'empty-dir-no-index'))).toEqual([])
  })

  it('breaks a date tie by falling back to discovery order (by slug), not chronological order', () => {
    const entries = buildChangelog(join(fixturesDir, 'tied-changelog-date'))

    expect(entries.map((e) => e.slug)).toEqual(['entry-a', 'entry-b'])
    expect(entries[0].date).toBe(entries[1].date)
  })
})
