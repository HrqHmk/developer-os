import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

export type DiscoveredEntryFile = {
  slug: string
  filePath: string
  raw: string
}

/**
 * Lists every content entry directory that contains an `index.md`, reading
 * its raw file content. Pure `node:fs`, no glob — this must be callable both
 * from `vite.config.ts` (plain Node, outside Vite's transform graph) and
 * from the pipeline itself. Shared by every content type (Article, Project,
 * ...) — each caller supplies its own `entriesDir`.
 */
export function discoverEntries(entriesDir: string): DiscoveredEntryFile[] {
  let entries: string[]
  try {
    entries = readdirSync(entriesDir)
  } catch (cause) {
    // A missing/inaccessible entries directory is a build misconfiguration
    // (wrong path, permissions, I/O error) — it must fail loud, not degrade
    // to an empty listing. A real, empty directory never reaches this catch:
    // `readdirSync` on an existing empty directory returns `[]` directly.
    throw new Error(`Failed to read entries directory at "${entriesDir}"`, { cause })
  }

  return entries
    .filter((entry) => statSync(join(entriesDir, entry)).isDirectory())
    .map((slug) => ({ slug, filePath: join(entriesDir, slug, 'index.md') }))
    .filter(({ filePath }) => {
      try {
        return statSync(filePath).isFile()
      } catch (cause) {
        // A missing `index.md` (ENOENT) means the directory simply isn't a
        // content entry — that's expected and gets filtered out. Any other
        // error inspecting it (EACCES, EIO, ...) is a real filesystem
        // failure and must fail the build loudly, not be read as "no
        // content here".
        if (cause instanceof Error && (cause as NodeJS.ErrnoException).code === 'ENOENT') {
          return false
        }
        throw new Error(`Failed to inspect content entry at "${filePath}"`, { cause })
      }
    })
    .map(({ slug, filePath }) => ({
      slug,
      filePath,
      raw: readFileSync(filePath, 'utf-8'),
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}
