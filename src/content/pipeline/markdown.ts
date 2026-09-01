import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

type MinimalNode = { type: string; children?: MinimalNode[] }

function containsRawHtml(node: MinimalNode): boolean {
  if (node.type === 'html') return true
  return (node.children ?? []).some(containsRawHtml)
}

/**
 * Remark plugin enforcing P9 (ADR-0003): raw HTML in Markdown content fails
 * the build instead of being silently dropped. Walks the mdast tree for any
 * `html` node — mdast represents both inline HTML and HTML blocks with that
 * same node type, so a single check covers both. No new dependency: this is
 * a plain recursive walk, not `unist-util-visit`.
 */
function rejectRawHtml() {
  return (tree: MinimalNode) => {
    if (containsRawHtml(tree)) {
      throw new Error(
        'Raw HTML is not allowed in Markdown content (ADR-0003 P9). ' +
          'Express the content using Markdown syntax instead.',
      )
    }
  }
}

/**
 * Compiles a Markdown body into an HTML string, entirely synchronously.
 * The plugin chain is deliberately synchronous-compatible (`processSync`)
 * so `buildArticles()` can run at `vite.config.ts` module-evaluation time,
 * with no `await` plumbing.
 */
export function toHtml(markdown: string): string {
  const file = unified()
    .use(remarkParse)
    .use(rejectRawHtml)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(markdown)

  return String(file)
}
