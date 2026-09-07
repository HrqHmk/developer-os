export type LearningItem = {
  topic: string
  description: string
  focus?: string
  articleSlug?: string
  projectSlug?: string
}

export type LearningSection = {
  title: string
  items: LearningItem[]
}

export const learningSections: LearningSection[] = [
  {
    title: 'Currently learning',
    items: [
      {
        topic: 'AI Engineering & Agent Orchestration',
        description:
          'How to direct multiple AI agents toward a shared specification instead of letting any single one drive unsupervised.',
        focus:
          'Workflow design for multi-agent review — Claude implementing, Codex reviewing independently — and where human-in-the-loop checkpoints actually change the outcome versus where they just add ceremony.',
        articleSlug: 'why-im-building-developer-os',
      },
      {
        topic: 'Software Architecture & Decision Records',
        description:
          'Writing architecture as explicit, falsifiable decisions instead of implicit tribal knowledge that only lives in someone’s head.',
        focus:
          'Structuring trade-offs as durable properties (ADRs) that survive a tool swap, and knowing when a decision deserves that weight versus when it’s just an implementation detail.',
        projectSlug: 'developer-os',
      },
    ],
  },
  {
    title: 'Recently explored',
    items: [
      {
        topic: 'Static-first content architecture',
        description:
          'Content pipelines that validate and compile at build time, with no database and no runtime parsing — and where that model starts to strain.',
      },
    ],
  },
]
