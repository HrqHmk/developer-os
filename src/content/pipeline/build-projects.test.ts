import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildProjects } from './build-projects'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__')

describe('buildProjects', () => {
  it('returns validated projects with the Markdown body compiled to HTML', () => {
    const projects = buildProjects(join(fixturesDir, 'valid-projects'))

    expect(projects.map((p) => p.slug)).toEqual(['sample-project'])
    expect(projects[0].title).toBe('Sample Project')
    expect(projects[0].technologies).toEqual(['TypeScript', 'Vitest'])
    expect(projects[0].repositoryUrl).toBe('https://github.com/example/sample-project')
    // Proves buildProjects() → toHtml() is wired correctly, without
    // re-testing toHtml's own raw-HTML rejection policy (see markdown.test.ts).
    expect(projects[0].html).toContain('<h2>Architecture</h2>')
  })

  it('throws when a project is missing a required frontmatter field', () => {
    expect(() =>
      buildProjects(join(fixturesDir, 'invalid-projects', 'missing-field')),
    ).toThrow()
  })

  it('throws when a project has an unknown frontmatter field', () => {
    expect(() =>
      buildProjects(join(fixturesDir, 'invalid-projects', 'unknown-field')),
    ).toThrow()
  })

  it('returns an empty array for a directory with no projects', () => {
    expect(buildProjects(join(fixturesDir, 'discovery-sample', 'empty-dir-no-index'))).toEqual([])
  })
})
