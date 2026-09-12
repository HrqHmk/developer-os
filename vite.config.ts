import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { buildArticles } from './src/content/pipeline/build-articles.ts'
import { virtualArticlesPlugin } from './src/content/pipeline/virtual-articles-plugin.ts'
import { buildProjects } from './src/content/pipeline/build-projects.ts'
import { virtualProjectsPlugin } from './src/content/pipeline/virtual-projects-plugin.ts'
import { buildChangelog } from './src/content/pipeline/build-changelog.ts'
import { virtualChangelogPlugin } from './src/content/pipeline/virtual-changelog-plugin.ts'
import { rssAssetPlugin } from './src/content/pipeline/rss-asset-plugin.ts'
import { buildSearchIndex } from './src/content/pipeline/search-index.ts'
import { virtualSearchIndexPlugin } from './src/content/pipeline/virtual-search-index-plugin.ts'

// Compiled once here; each snapshot is then distributed to its own virtual
// module — a single canonical build per content type, not the same
// discovery re-run twice (ADR-0003 P2). Article and Project also feed the
// explicit prerender path list below, because both have a `$slug` route;
// Changelog has no per-entry route, so its snapshot only feeds its virtual
// module — its one page is reached by the prerender crawl instead (see
// `pages` below).
const articles = buildArticles()
const projects = buildProjects()
const changelogEntries = buildChangelog()

// Derived from the snapshots above rather than from a discovery pass of its
// own: Search consumes the canonical Article and Project snapshots, so it
// adds no second discovery/parsing pipeline (Issue #48). Changelog and
// Learning are out of Search v1's scope.
const searchIndex = buildSearchIndex(articles, projects)

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      pages: [
        ...articles.map((article) => ({ path: `/blog/${article.slug}` })),
        ...projects.map((project) => ({ path: `/projects/${project.slug}` })),
      ],
      prerender: {
        enabled: true,
      },
    }),
    virtualArticlesPlugin(articles),
    rssAssetPlugin(articles),
    virtualProjectsPlugin(projects),
    virtualChangelogPlugin(changelogEntries),
    virtualSearchIndexPlugin(searchIndex),
    viteReact(),
    tailwindcss(),
  ],
})
