import { z } from 'zod'

export const changelogFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    // Calendar date, not a timestamp: `YYYY-MM-DD`, no time, no timezone.
    // Same contract as Article's `publishedAt` — see `article.ts`.
    date: z.iso.date(),
  })
  .strict()

export type ChangelogFrontmatter = z.infer<typeof changelogFrontmatterSchema>
