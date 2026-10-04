import type { Locale } from '../../lib/locale.ts'

export type UsesItem = {
  name: string
  description: string
  href?: string
}

export type UsesSection = {
  title: string
  items: UsesItem[]
}

const englishSections: UsesSection[] = [
  {
    title: 'Development',
    items: [
      {
        name: 'Ubuntu',
        description: 'Primary OS for local development and the shell environment everything else runs in.',
      },
      {
        name: 'TypeScript',
        description: 'Primary language across the app, the content pipeline and the tests.',
        href: 'https://www.typescriptlang.org/',
      },
      {
        name: 'pnpm',
        description: 'Package manager for the whole workspace.',
        href: 'https://pnpm.io/',
      },
      {
        name: 'VS Code',
        description: 'Primary editor, configured for this repository’s conventions.',
        href: 'https://code.visualstudio.com/',
      },
      {
        name: 'Warp',
        description: 'Primary terminal for running the CLI tools this project is built with.',
        href: 'https://www.warp.dev/',
      },
      {
        name: 'GitHub',
        description: 'Hosts the repository; Issues and Pull Requests are how every change gets proposed and reviewed.',
        href: 'https://github.com/',
      },
    ],
  },
  {
    title: 'AI workflow',
    items: [
      {
        name: 'ChatGPT',
        description:
          'Requirements, architecture discussion, critique, orchestration and decision support — where ideas get pressure-tested before they become an Issue.',
        href: 'https://chatgpt.com/',
      },
      {
        name: 'Claude Code',
        description: 'Repository inspection, planning and implementation — writes the code that ships.',
        href: 'https://claude.com/claude-code',
      },
      {
        name: 'Codex',
        description:
          'Independent second opinion: planning and code review when the change justifies it, kept deliberately separate from the agent that implemented it — a reviewer that is also the author isn’t a review.',
        href: 'https://openai.com/codex/',
      },
    ],
  },
]

const portugueseSections: UsesSection[] = [
  {
    title: 'Desenvolvimento',
    items: [
      {
        name: 'Ubuntu',
        description: 'Sistema operacional principal para desenvolvimento local e o ambiente de shell em que todo o resto roda.',
      },
      {
        name: 'TypeScript',
        description: 'Linguagem principal da aplicação, do pipeline de conteúdo e dos testes.',
        href: 'https://www.typescriptlang.org/',
      },
      {
        name: 'pnpm',
        description: 'Gerenciador de pacotes de todo o workspace.',
        href: 'https://pnpm.io/',
      },
      {
        name: 'VS Code',
        description: 'Editor principal, configurado para as convenções deste repositório.',
        href: 'https://code.visualstudio.com/',
      },
      {
        name: 'Warp',
        description: 'Terminal principal para rodar as ferramentas de linha de comando com que este projeto é construído.',
        href: 'https://www.warp.dev/',
      },
      {
        name: 'GitHub',
        description: 'Hospeda o repositório; Issues e Pull Requests são a forma como toda mudança é proposta e revisada.',
        href: 'https://github.com/',
      },
    ],
  },
  {
    title: 'Fluxo com IA',
    items: [
      {
        name: 'ChatGPT',
        description:
          'Requisitos, discussão de arquitetura, crítica, orquestração e apoio à decisão — onde as ideias são postas à prova antes de virarem uma Issue.',
        href: 'https://chatgpt.com/',
      },
      {
        name: 'Claude Code',
        description: 'Inspeção do repositório, planejamento e implementação — escreve o código que vai para produção.',
        href: 'https://claude.com/claude-code',
      },
      {
        name: 'Codex',
        description:
          'Segunda opinião independente: revisão de planejamento e de código quando a mudança justifica, mantida deliberadamente separada do agente que implementou — um revisor que também é o autor não é uma revisão.',
        href: 'https://openai.com/codex/',
      },
    ],
  },
]

/**
 * One list per language (Issue #83). Both must list the same tools in the
 * same order with the same links; names are product names and stay as they
 * are, only titles and descriptions are translated. `localized-data.test.ts` holds
 * that parity.
 */
export const usesSections: Record<Locale, UsesSection[]> = {
  en: englishSections,
  'pt-br': portugueseSections,
}
