import { describe, expect, it } from 'vitest'
import { changelogFrontmatterSchema } from './changelog'

const valid = {
  title: 'A Title',
  date: '2026-09-01',
}

describe('changelogFrontmatterSchema', () => {
  it('accepts a valid calendar date and keeps it as a string', () => {
    const result = changelogFrontmatterSchema.parse(valid)

    expect(result.title).toBe('A Title')
    expect(result.date).toBe('2026-09-01')
    expect(typeof result.date).toBe('string')
  })

  it('rejects an unknown field', () => {
    expect(() => changelogFrontmatterSchema.parse({ ...valid, category: 'feature' })).toThrow()
  })

  it.each(['title', 'date'])('rejects a missing required field: %s', (field) => {
    const { [field]: _omit, ...withoutField } = valid as Record<string, unknown>
    expect(() => changelogFrontmatterSchema.parse(withoutField)).toThrow()
  })

  it.each(['2026/09/01', '2026-9-1', '2026-09-01T00:00:00Z'])(
    'rejects an invalid date format: %s',
    (date) => {
      expect(() => changelogFrontmatterSchema.parse({ ...valid, date })).toThrow()
    },
  )

  it('rejects a calendar-impossible date', () => {
    expect(() => changelogFrontmatterSchema.parse({ ...valid, date: '2026-02-30' })).toThrow()
  })
})
