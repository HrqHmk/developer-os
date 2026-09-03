import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { discoverEntries } from './discovery'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('discoverEntries', () => {
  it('lists only directories that contain an index.md, sorted by slug', () => {
    const found = discoverEntries(join(fixturesDir, 'discovery-sample'))

    expect(found.map((a) => a.slug)).toEqual(['article-a', 'article-b'])
  })

  it('ignores non-directory entries and directories without an index.md', () => {
    const found = discoverEntries(join(fixturesDir, 'discovery-sample'))

    expect(found.some((a) => a.slug === 'not-a-directory.md')).toBe(false)
    expect(found.some((a) => a.slug === 'empty-dir-no-index')).toBe(false)
  })

  it('reads the raw file content for each discovered entry', () => {
    const found = discoverEntries(join(fixturesDir, 'discovery-sample'))
    const entryA = found.find((a) => a.slug === 'article-a')

    expect(entryA?.raw).toContain('title: Article A')
    expect(entryA?.raw).toContain('Body A.')
  })

  it('throws when the entries directory does not exist, instead of silently returning []', () => {
    const missingDir = join(fixturesDir, 'does-not-exist')

    expect(() => discoverEntries(missingDir)).toThrow(/Failed to read entries directory/)
  })

  it('returns an empty list for a directory that exists but has no entries', () => {
    const emptyDir = join(fixturesDir, 'discovery-sample', 'empty-dir-no-index')

    expect(discoverEntries(emptyDir)).toEqual([])
  })
})
