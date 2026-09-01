import matter from 'gray-matter'
import { articleFrontmatterSchema, type ArticleFrontmatter } from '../schemas/article.ts'

export type ParsedArticle = {
  frontmatter: ArticleFrontmatter
  body: string
}

/**
 * Extracts frontmatter + Markdown body from a raw file and validates the
 * frontmatter against the article schema. Throws on invalid or unknown
 * fields (P4) — content that fails validation must fail the build, not
 * degrade silently.
 */
export function parseFrontmatter(raw: string, context: string): ParsedArticle {
  const { data, content } = matter(raw)
  const result = articleFrontmatterSchema.safeParse(data)

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid frontmatter for article "${context}":\n${issues}`)
  }

  return { frontmatter: result.data, body: content }
}
