import { z } from 'zod'

export const projectFrontmatterSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    technologies: z.array(z.string().min(1)).min(1),
    repositoryUrl: z.url().optional(),
  })
  .strict()

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>
