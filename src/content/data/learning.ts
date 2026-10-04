import type { Locale } from '../../lib/locale.ts'

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

const englishSections: LearningSection[] = [
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

const portugueseSections: LearningSection[] = [
  {
    title: 'Estudando agora',
    items: [
      {
        topic: 'AI Engineering e orquestração de agentes',
        description:
          'Como direcionar vários agentes de IA para uma especificação compartilhada, em vez de deixar qualquer um deles conduzir sem supervisão.',
        focus:
          'Desenho de fluxo para revisão com múltiplos agentes — Claude implementando, Codex revisando de forma independente — e onde os pontos de controle com human-in-the-loop de fato mudam o resultado, em vez de só adicionar cerimônia.',
        articleSlug: 'why-im-building-developer-os',
      },
      {
        topic: 'Arquitetura de software e registros de decisão',
        description:
          'Escrever arquitetura como decisões explícitas e refutáveis, em vez de conhecimento tácito que só vive na cabeça de alguém.',
        focus:
          'Estruturar trade-offs como propriedades duráveis (ADRs) que sobrevivem a uma troca de ferramenta, e saber quando uma decisão merece esse peso e quando é só um detalhe de implementação.',
        projectSlug: 'developer-os',
      },
    ],
  },
  {
    title: 'Explorado recentemente',
    items: [
      {
        topic: 'Arquitetura de conteúdo static-first',
        description:
          'Pipelines de conteúdo que validam e compilam em tempo de build, sem banco de dados e sem parsing em runtime — e onde esse modelo começa a ficar apertado.',
      },
    ],
  },
]

/**
 * One list per language (Issue #83). Both must describe the same topics in
 * the same order, with the same article/project references — only the prose
 * is translated. `localized-data.test.ts` holds that parity.
 */
export const learningSections: Record<Locale, LearningSection[]> = {
  en: englishSections,
  'pt-br': portugueseSections,
}
