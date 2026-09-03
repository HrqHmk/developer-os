import matter from 'gray-matter'
import jsYaml from 'js-yaml'
import type { z } from 'zod'

// `js-yaml` is CommonJS; named imports (`import { safeLoad } from 'js-yaml'`)
// fail under plain Node ESM interop when `vite.config.ts` itself is loaded
// (Node's cjs-module-lexer doesn't statically resolve them there, even
// though Vite's own SSR/test transform is more permissive and would accept
// them). Destructuring the default export works uniformly in both contexts.
const { safeLoad, JSON_SCHEMA } = jsYaml

/**
 * gray-matter's default YAML engine (js-yaml's `safeLoad` with its default
 * schema) auto-promotes unquoted date-like scalars (`publishedAt: 2026-09-04`)
 * to a JS `Date`. Content that models a calendar date (e.g. Article's
 * `publishedAt`) validates the string form via schema (`z.iso.date()`), so
 * the value must reach it unmodified. `JSON_SCHEMA` has no date/timestamp
 * type, so a scalar like `2026-09-04` parses as a plain string, exactly as
 * written. This is configuration of the already-used YAML engine, not a
 * custom parser, and applies uniformly regardless of which content type's
 * schema is passed in.
 */
const yamlEngine = (input: string): object => safeLoad(input, { schema: JSON_SCHEMA }) as object

/**
 * Extracts frontmatter + Markdown body from a raw file and validates the
 * frontmatter against the given content-type schema (Article, Project, ...).
 * Throws on invalid or unknown fields (ADR-0003 P4) — content that fails
 * validation must fail the build, not degrade silently. `context` is a
 * human-readable identifier (typically the entry's slug) used only to
 * label the error.
 */
export function parseFrontmatter<Schema extends z.ZodType>(
  raw: string,
  schema: Schema,
  context: string,
): { frontmatter: z.infer<Schema>; body: string } {
  const { data, content } = matter(raw, { engines: { yaml: yamlEngine } })
  const result = schema.safeParse(data)

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid frontmatter for "${context}":\n${issues}`)
  }

  return { frontmatter: result.data, body: content }
}
