import { z } from 'zod'

export const articleFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
  })
  .strict()

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>
