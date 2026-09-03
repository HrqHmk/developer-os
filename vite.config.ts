import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { buildArticles } from './src/content/pipeline/build-articles.ts'
import { virtualArticlesPlugin } from './src/content/pipeline/virtual-articles-plugin.ts'
import { buildProjects } from './src/content/pipeline/build-projects.ts'
import { virtualProjectsPlugin } from './src/content/pipeline/virtual-projects-plugin.ts'

// Compiled once here; each snapshot is then distributed to both the explicit
// prerender path list and its own virtual module — a single canonical build
// per content type, not the same discovery re-run twice (ADR-0003 P2).
const articles = buildArticles()
const projects = buildProjects()

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
    virtualProjectsPlugin(projects),
    viteReact(),
    tailwindcss(),
  ],
})
