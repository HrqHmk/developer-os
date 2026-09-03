import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { projectFrontmatterSchema } from '../schemas/project.ts'
import { discoverEntries } from './discovery.ts'
import { parseFrontmatter } from './frontmatter.ts'
import { toHtml } from './markdown.ts'

const defaultProjectsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'entries',
  'projects',
)

export type CompiledProject = {
  slug: string
  title: string
  description: string
  technologies: string[]
  repositoryUrl?: string
  html: string
}

/**
 * The single public entry point of the Project content pipeline (ADR-0003
 * P2, P4). Discovers, validates, and processes every project synchronously
 * and returns an already-compiled snapshot. Throws on the first invalid
 * project — content that fails validation must fail the build, never reach
 * the returned snapshot.
 *
 * Deliberately has no cache/memoization, and no sort: there is no ordering
 * requirement for Projects today (unlike Article's `publishedAt`).
 */
export function buildProjects(projectsDir = defaultProjectsDir): CompiledProject[] {
  const discovered = discoverEntries(projectsDir)

  return discovered.map(({ slug, raw }) => {
    const { frontmatter, body } = parseFrontmatter(raw, projectFrontmatterSchema, slug)
    return {
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      technologies: frontmatter.technologies,
      repositoryUrl: frontmatter.repositoryUrl,
      html: toHtml(body),
    }
  })
}
