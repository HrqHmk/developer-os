import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { discoverArticles } from './discovery'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('discoverArticles', () => {
  it('lists only directories that contain an index.md, sorted by slug', () => {
    const found = discoverArticles(join(fixturesDir, 'discovery-sample'))

    expect(found.map((a) => a.slug)).toEqual(['article-a', 'article-b'])
  })

  it('ignores non-directory entries and directories without an index.md', () => {
    const found = discoverArticles(join(fixturesDir, 'discovery-sample'))

    expect(found.some((a) => a.slug === 'not-a-directory.md')).toBe(false)
    expect(found.some((a) => a.slug === 'empty-dir-no-index')).toBe(false)
  })

  it('reads the raw file content for each discovered article', () => {
    const found = discoverArticles(join(fixturesDir, 'discovery-sample'))
    const articleA = found.find((a) => a.slug === 'article-a')

    expect(articleA?.raw).toContain('title: Article A')
    expect(articleA?.raw).toContain('Body A.')
  })

  it('returns an empty list for a directory that does not exist', () => {
    expect(discoverArticles(join(fixturesDir, 'does-not-exist'))).toEqual([])
  })
})
