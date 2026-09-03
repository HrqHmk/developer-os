import { describe, expect, it } from 'vitest'
import { projectFrontmatterSchema } from './project'

const valid = {
  title: 'Developer OS',
  description: 'A public engineering lab.',
  technologies: ['TypeScript', 'React', 'TanStack Start'],
}

describe('projectFrontmatterSchema', () => {
  it('accepts a valid project', () => {
    const result = projectFrontmatterSchema.parse(valid)

    expect(result.title).toBe('Developer OS')
    expect(result.technologies).toEqual(['TypeScript', 'React', 'TanStack Start'])
    expect(result.repositoryUrl).toBeUndefined()
  })

  it('accepts an optional repositoryUrl when it is a valid URL', () => {
    const result = projectFrontmatterSchema.parse({
      ...valid,
      repositoryUrl: 'https://github.com/HrqHmk/developer-os',
    })

    expect(result.repositoryUrl).toBe('https://github.com/HrqHmk/developer-os')
  })

  it.each(['title', 'description', 'technologies'])('rejects a missing required field: %s', (field) => {
    const { [field]: _omit, ...withoutField } = valid as Record<string, unknown>
    expect(() => projectFrontmatterSchema.parse(withoutField)).toThrow()
  })

  it('rejects technologies that is not an array', () => {
    expect(() => projectFrontmatterSchema.parse({ ...valid, technologies: 'TypeScript' })).toThrow()
  })

  it('rejects an empty technologies array', () => {
    expect(() => projectFrontmatterSchema.parse({ ...valid, technologies: [] })).toThrow()
  })

  it('rejects an empty string inside technologies', () => {
    expect(() => projectFrontmatterSchema.parse({ ...valid, technologies: ['TypeScript', ''] })).toThrow()
  })

  it('rejects an invalid repositoryUrl', () => {
    expect(() =>
      projectFrontmatterSchema.parse({ ...valid, repositoryUrl: 'not-a-url' }),
    ).toThrow()
  })

  it('rejects an unknown field', () => {
    expect(() => projectFrontmatterSchema.parse({ ...valid, status: 'active' })).toThrow()
  })
})
