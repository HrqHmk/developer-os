import { describe, expect, it } from 'vitest'
import { articleFrontmatterSchema } from './article'

const valid = {
  title: 'A Title',
  description: 'A description.',
  publishedAt: '2026-09-01',
}

describe('articleFrontmatterSchema', () => {
  it('accepts a valid calendar date and keeps it as a string', () => {
    const result = articleFrontmatterSchema.parse(valid)

    expect(result.publishedAt).toBe('2026-09-01')
    expect(typeof result.publishedAt).toBe('string')
  })

  it('rejects an unknown field', () => {
    expect(() => articleFrontmatterSchema.parse({ ...valid, tags: ['x'] })).toThrow()
  })

  it.each(['2026/09/01', '09-01-2026', '2026-9-1', '2026-09-01T00:00:00Z', 'not-a-date'])(
    'rejects an invalid publishedAt format: %s',
    (publishedAt) => {
      expect(() => articleFrontmatterSchema.parse({ ...valid, publishedAt })).toThrow()
    },
  )

  it.each(['2026-02-30', '2026-13-01', '2026-04-31'])(
    'rejects a calendar-impossible publishedAt: %s',
    (publishedAt) => {
      expect(() => articleFrontmatterSchema.parse({ ...valid, publishedAt })).toThrow()
    },
  )
})
