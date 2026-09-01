import matter from 'gray-matter'
import jsYaml from 'js-yaml'
import { articleFrontmatterSchema, type ArticleFrontmatter } from '../schemas/article.ts'

// `js-yaml` is CommonJS; named imports (`import { safeLoad } from 'js-yaml'`)
// fail under plain Node ESM interop when `vite.config.ts` itself is loaded
// (Node's cjs-module-lexer doesn't statically resolve them there, even
// though Vite's own SSR/test transform is more permissive and would accept
// them). Destructuring the default export works uniformly in both contexts.
const { safeLoad, JSON_SCHEMA } = jsYaml

export type ParsedArticle = {
  frontmatter: ArticleFrontmatter
  body: string
}

/**
 * gray-matter's default YAML engine (js-yaml's `safeLoad` with its default
 * schema) auto-promotes unquoted date-like scalars (`publishedAt: 2026-09-04`)
 * to a JS `Date`. `publishedAt` is a calendar date, not a timestamp — the
 * schema (`z.iso.date()`) validates the string form, so the value must reach
 * it unmodified. `JSON_SCHEMA` has no date/timestamp type, so a scalar like
 * `2026-09-04` parses as a plain string, exactly as written. This is
 * configuration of the already-used YAML engine, not a custom parser.
 */
const yamlEngine = (input: string): object => safeLoad(input, { schema: JSON_SCHEMA }) as object

/**
 * Extracts frontmatter + Markdown body from a raw file and validates the
 * frontmatter against the article schema. Throws on invalid or unknown
 * fields (P4) — content that fails validation must fail the build, not
 * degrade silently.
 */
export function parseFrontmatter(raw: string, context: string): ParsedArticle {
  const { data, content } = matter(raw, { engines: { yaml: yamlEngine } })
  const result = articleFrontmatterSchema.safeParse(data)

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid frontmatter for article "${context}":\n${issues}`)
  }

  return { frontmatter: result.data, body: content }
}
