import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { buildLocalizedArticles } from './src/content/pipeline/build-articles.ts'
import { virtualArticlesPlugin } from './src/content/pipeline/virtual-articles-plugin.ts'
import { buildLocalizedProjects } from './src/content/pipeline/build-projects.ts'
import { virtualProjectsPlugin } from './src/content/pipeline/virtual-projects-plugin.ts'
import { buildLocalizedChangelog } from './src/content/pipeline/build-changelog.ts'
import { virtualChangelogPlugin } from './src/content/pipeline/virtual-changelog-plugin.ts'
import { rssAssetPlugin } from './src/content/pipeline/rss-asset-plugin.ts'
import { buildSearchIndex } from './src/content/pipeline/search-index.ts'
import { virtualSearchIndexPlugin } from './src/content/pipeline/virtual-search-index-plugin.ts'

// Compiled once here; each snapshot is then distributed to its own virtual
// module — a single canonical build per content type, not the same
// discovery re-run twice (ADR-0003 P2). Article and Project also feed the
// explicit prerender path list below, because both have a `$slug` route:
// dynamic routes are the ones automatic discovery does not find.
// Changelog has no per-entry route, so its snapshot only feeds its virtual
// module — its one page is static, and static routes are prerendered from
// the route tree by TanStack Start's own discovery, with no `pages` entry
// (conventions.md §8.6).
//
// Each snapshot holds both languages, and building it fails when an entry
// lacks its PT-BR translation (Issue #83, ADR-0011): parity is enforced here,
// once, before anything is rendered. Slugs are the same in both languages,
// so PT-BR detail pages are the English list with the `/pt-br` prefix.
const articles = buildLocalizedArticles()
const projects = buildLocalizedProjects()
const changelogEntries = buildLocalizedChangelog()

// Derived from the snapshots above rather than from a discovery pass of its
// own: Search consumes the canonical Article and Project snapshots, so it
// adds no second discovery/parsing pipeline (Issue #48). Changelog and
// Learning are out of Search v1's scope. One index per language, so a search
// on one never returns documents in the other (Issue #83).
const searchIndex = {
  en: buildSearchIndex(articles.en, projects.en),
  'pt-br': buildSearchIndex(articles['pt-br'], projects['pt-br']),
}

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      pages: [
        ...articles.en.map((article) => ({ path: `/blog/${article.slug}` })),
        ...projects.en.map((project) => ({ path: `/projects/${project.slug}` })),
        ...articles['pt-br'].map((article) => ({ path: `/pt-br/blog/${article.slug}` })),
        ...projects['pt-br'].map((project) => ({ path: `/pt-br/projects/${project.slug}` })),
      ],
      prerender: {
        enabled: true,
      },
    }),
    virtualArticlesPlugin(articles),
    // RSS stays English-only (Issue #83 scope decision): no PT-BR feed.
    rssAssetPlugin(articles.en),
    virtualProjectsPlugin(projects),
    virtualChangelogPlugin(changelogEntries),
    virtualSearchIndexPlugin(searchIndex),
    viteReact(),
    tailwindcss(),
  ],
})
