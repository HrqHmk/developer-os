import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const defaultArticlesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'entries',
  'articles',
)

export type DiscoveredArticleFile = {
  slug: string
  filePath: string
  raw: string
}

/**
 * Lists every article entry directory that contains an `index.md`, reading
 * its raw file content. Pure `node:fs`, no glob — this must be callable both
 * from `vite.config.ts` (plain Node, outside Vite's transform graph) and
 * from the pipeline itself.
 */
export function discoverArticles(articlesDir = defaultArticlesDir): DiscoveredArticleFile[] {
  let entries: string[]
  try {
    entries = readdirSync(articlesDir)
  } catch (cause) {
    // A missing/inaccessible articles directory is a build misconfiguration
    // (wrong path, permissions, I/O error) — it must fail loud, not degrade
    // to an empty blog. A real, empty directory never reaches this catch:
    // `readdirSync` on an existing empty directory returns `[]` directly.
    throw new Error(`Failed to read articles directory at "${articlesDir}"`, { cause })
  }

  return entries
    .filter((entry) => statSync(join(articlesDir, entry)).isDirectory())
    .map((slug) => ({ slug, filePath: join(articlesDir, slug, 'index.md') }))
    .filter(({ filePath }) => {
      try {
        return statSync(filePath).isFile()
      } catch {
        return false
      }
    })
    .map(({ slug, filePath }) => ({
      slug,
      filePath,
      raw: readFileSync(filePath, 'utf-8'),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}
