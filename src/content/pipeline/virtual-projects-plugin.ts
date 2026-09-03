import type { Plugin } from 'vite'
import type { CompiledProject } from './build-projects.ts'

const virtualModuleId = 'virtual:projects'
const resolvedVirtualModuleId = '\0' + virtualModuleId

/**
 * Exposes an already-compiled project snapshot to the application as a
 * Vite virtual module. Receives the snapshot as a parameter — it never
 * imports `buildProjects`, `discovery`, `frontmatter`, `markdown`, or any
 * of `node:fs` / `gray-matter` / `unified`. It only serializes data it was
 * handed; the compiler itself is unreachable from here.
 */
export function virtualProjectsPlugin(projects: CompiledProject[]): Plugin {
  return {
    name: 'virtual-projects',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const projects = ${JSON.stringify(projects)}`
      }
    },
  }
}
