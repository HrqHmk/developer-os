import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseFrontmatter } from './frontmatter'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__')

function readFixture(...segments: string[]) {
  return readFileSync(join(fixturesDir, ...segments), 'utf-8')
}

describe('parseFrontmatter', () => {
  it('parses valid frontmatter and separates it from the body', () => {
    const raw = readFixture('valid-articles', 'why-example', 'index.md')

    const { frontmatter, body } = parseFrontmatter(raw, 'why-example')

    expect(frontmatter.title).toBe('Why Example')
    expect(frontmatter.description).toBe(
      'A valid fixture article used to verify the pipeline end to end.',
    )
    expect(frontmatter.publishedAt).toBeInstanceOf(Date)
    expect(body).toContain('## Heading')
    expect(body).not.toContain('title:')
  })

  it('throws when a required field is missing', () => {
    const raw = readFixture('invalid-missing-field', 'broken', 'index.md')

    expect(() => parseFrontmatter(raw, 'broken')).toThrow(/description/i)
  })

  it('throws when the frontmatter has an unknown field', () => {
    const raw = readFixture('invalid-unknown-field', 'broken', 'index.md')

    expect(() => parseFrontmatter(raw, 'broken')).toThrow(/tags|unrecognized|unknown/i)
  })
})
