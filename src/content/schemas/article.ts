import { z } from 'zod'

export const articleFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    // Calendar date, not a timestamp: `YYYY-MM-DD`, no time, no timezone.
    // `z.iso.date()` validates exact format and real calendar bounds (leap
    // years, days-per-month) — it never converts to `Date`.
    publishedAt: z.iso.date(),
  })
  .strict()

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>
