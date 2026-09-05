export type UsesItem = {
  name: string
  description: string
  href?: string
}

export type UsesSection = {
  title: string
  items: UsesItem[]
}

export const usesSections: UsesSection[] = [
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
