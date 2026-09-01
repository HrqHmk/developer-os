import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { buildArticles } from './src/content/pipeline/build-articles.ts'
import { virtualArticlesPlugin } from './src/content/pipeline/virtual-articles-plugin.ts'

// Compiled once here; the snapshot is then distributed to both the explicit
// prerender path list and the virtual module — a single canonical build of
// the content pipeline, not the same discovery re-run twice (ADR-0003 P2).
const articles = buildArticles()

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      pages: articles.map((article) => ({ path: `/blog/${article.slug}` })),
      prerender: {
        enabled: true,
      },
    }),
    virtualArticlesPlugin(articles),
    viteReact(),
    tailwindcss(),
  ],
})
