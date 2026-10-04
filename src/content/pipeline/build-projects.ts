import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Locale } from '../../lib/locale.ts'
import { projectFrontmatterSchema } from '../schemas/project.ts'
import { discoverEntries, entryFileName } from './discovery.ts'
import { parseFrontmatter } from './frontmatter.ts'
import { assertLocaleParity } from './locale-parity.ts'
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
export function buildProjects(
  projectsDir = defaultProjectsDir,
  locale: Locale = 'en',
): CompiledProject[] {
  const discovered = discoverEntries(projectsDir, entryFileName(locale))

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

/**
 * Both language snapshots of the Project type, checked for parity (Issue
 * #83): every project has a PT-BR translation, and `technologies` and
 * `repositoryUrl` describe the project, not its prose, so they must match.
 */
export function buildLocalizedProjects(
  projectsDir = defaultProjectsDir,
): Record<Locale, CompiledProject[]> {
  const en = buildProjects(projectsDir, 'en')
  const ptBr = buildProjects(projectsDir, 'pt-br')
  assertLocaleParity('Project', en, ptBr, ['technologies', 'repositoryUrl'])
  return { en, 'pt-br': ptBr }
}
