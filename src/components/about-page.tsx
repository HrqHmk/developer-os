import { Link } from '@tanstack/react-router'
import { localePrefix, type Locale } from '../lib/locale'

const COPY_EN = {
  title: 'About Developer OS',
  lead: "Developer OS is a public engineering lab, not a portfolio. It's where I design, build, and document real software — including how I work with AI agents to do it.",
  body: "Every architectural decision, convention, and trade-off lives here in the open: as documentation before code, as an issue before a branch, as a diff a human reviews before it ships. The goal isn't just to show what got built, but how — and why.",
  pillars: [
    {
      term: 'Engineering',
      description: "Decisions are specified and documented before they're implemented.",
    },
    {
      term: 'AI orchestration',
      description: 'AI agents write and review code here; a human validates architecture and quality.',
    },
    {
      term: 'Learning in public',
      description: 'Progress, mistakes, and revisions stay visible instead of being polished away.',
    },
  ],
  home: '← Home',
}

const COPY: Record<Locale, typeof COPY_EN> = {
  en: COPY_EN,
  'pt-br': {
    title: 'Sobre o Developer OS',
    lead: 'O Developer OS é um laboratório público de engenharia, não um portfólio. É onde eu desenho, construo e documento software de verdade — incluindo como trabalho com agentes de IA para fazer isso.',
    body: 'Cada decisão arquitetural, convenção e trade-off fica aqui à vista: como documentação antes do código, como uma issue antes de uma branch, como um diff que um humano revisa antes de ir para produção. O objetivo não é só mostrar o que foi construído, mas como — e por quê.',
    pillars: [
      {
        term: 'Engenharia',
        description: 'Decisões são especificadas e documentadas antes de serem implementadas.',
      },
      {
        term: 'Orquestração de IA',
        description:
          'Agentes de IA escrevem e revisam código aqui; um humano valida a arquitetura e a qualidade.',
      },
      {
        term: 'Aprendizado em público',
        description: 'Progresso, erros e revisões continuam visíveis, em vez de serem apagados.',
      },
    ],
    home: '← Início',
  },
}

/** The About lead paragraph, reused verbatim by the home page's About section. */
export function aboutSummary(locale: Locale): string {
  return COPY[locale].lead
}

export function aboutTitle(locale: Locale): string {
  return COPY[locale].title
}

export function AboutPage({ locale }: Readonly<{ locale: Locale }>) {
  const copy = COPY[locale]

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="relative isolate space-y-4">
        <div aria-hidden="true" className="page-backdrop page-backdrop-listing" />
        <h1 className="text-3xl font-bold sm:text-4xl">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">{copy.lead}</p>
        <p className="text-lg text-muted-foreground">{copy.body}</p>
      </div>
      <dl className="space-y-4">
        {copy.pillars.map((pillar) => (
          <div key={pillar.term}>
            <dt className="font-semibold">{pillar.term}</dt>
            <dd className="text-muted-foreground">{pillar.description}</dd>
          </div>
        ))}
      </dl>
      <Link to={localePrefix(locale) || '/'} className="text-sm text-muted-foreground hover:text-foreground">
        {copy.home}
      </Link>
    </main>
  )
}
