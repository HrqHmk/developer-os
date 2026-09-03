import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__')

// Shared mutable state the mock factory closes over — `vi.hoisted` guarantees
// it exists before `vi.mock`'s factory runs, since `vi.mock` itself is
// hoisted above this file's imports.
const fsMockState = vi.hoisted(() => ({ brokenPath: null as string | null }))

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return {
    ...actual,
    statSync: (...args: Parameters<typeof actual.statSync>) => {
      if (fsMockState.brokenPath && args[0] === fsMockState.brokenPath) {
        const error = new Error('permission denied') as NodeJS.ErrnoException
        error.code = 'EACCES'
        throw error
      }
      return actual.statSync(...args)
    },
  }
})

const { discoverEntries } = await import('./discovery')

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

  it('propagates a real filesystem error inspecting index.md, instead of treating it as a missing entry', () => {
    const dir = join(fixturesDir, 'discovery-sample')
    fsMockState.brokenPath = join(dir, 'article-a', 'index.md')

    try {
      expect(() => discoverEntries(dir)).toThrow(/Failed to inspect content entry/)
    } finally {
      fsMockState.brokenPath = null
    }
  })
})
