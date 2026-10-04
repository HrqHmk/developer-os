import { Link } from '@tanstack/react-router'
import { localePrefix, type Locale } from '../lib/locale'

type Entry = { title: string; description: string }

const COPY_EN = {
  title: 'Architecture',
  lead: 'How Developer OS is structured, and what principles keep it simple as it grows.',
  overviewTitle: 'Architecture overview',
  overview:
    "Developer OS is a single application built with TanStack Start, React and TypeScript. It's hosted on Cloudflare and developed in the open on GitHub, where every change is proposed, reviewed and merged. Content that doesn't need to change per request — articles, project pages, this page — is processed once, at build time, and shipped as a static artifact rather than computed on every visit.",
  principlesTitle: 'Core principles',
  principles: [
    {
      title: 'Simplicity first',
      description:
        'The simplest solution that satisfies today’s requirement wins — infrastructure and abstraction wait for a concrete need, not a hypothetical one.',
    },
    {
      title: 'Abstractions require a real consumer',
      description:
        'Shared code is extracted after a second real caller shows up, never in anticipation of one. Three similar lines beat a premature abstraction.',
    },
    {
      title: 'Build-time when runtime is unnecessary',
      description:
        'Whatever can be resolved once, at build time, is — content processing, validation, and prerendering all happen before a request ever exists.',
    },
    {
      title: 'Incremental evolution',
      description:
        'The structure grows by adding what’s needed next, not by anticipating a future shape. Directories and layers appear when code justifies them.',
    },
    {
      title: 'Durable decisions are recorded',
      description:
        'Trade-offs that should survive the next rewrite are written down as decision records, not left as tribal knowledge in someone’s head.',
    },
    {
      title: 'Readable by humans and AI-assisted workflows',
      description:
        'Naming, structure, and documentation are kept predictable and explicit — legibility isn’t just for the next person, it’s for the next agent too.',
    },
  ] as Entry[],
  contentTitle: 'Content architecture',
  contentMarkdown:
    "Blog and Projects are prose-driven, so both are written in Markdown and go through the same build-only pipeline: discovery, frontmatter validation and Markdown processing are shared, because a second real content type showed up and justified sharing them. Each type still keeps its own entry point and its own output, deliberately not merged into one generic system — there's no second problem yet that a generic collections framework would actually solve. The result of that pipeline is a canonical, validated snapshot that feeds both the prerendered pages and the data each route reads from.",
  contentUses:
    "Uses takes a different path. It's a short, curated list with no independent prose body, so it lives as typed, structured data that its route imports directly — no pipeline, no validation step beyond the type checker.",
  markdownDiagram: {
    entries: 'Markdown entries',
    pipeline: 'build pipeline',
    snapshot: 'canonical snapshot',
    prerender: 'prerender',
    routes: 'virtual module → routes',
  },
  usesDiagram: {
    uses: 'Uses',
    data: 'typed TypeScript data',
    route: 'imported directly by the route',
  },
  contentClosing:
    "Neither path is generalized further than this — a generic content framework would be solving a problem the project doesn't have yet.",
  workflowTitle: 'AI-assisted development workflow',
  workflowLead:
    'Every non-trivial change follows the same shape, regardless of who — or what — writes the code:',
  workflowSteps: [
    'a problem shows up;',
    'requirements and architecture get discussed before anything is built;',
    'that discussion becomes an Issue — the contract for the work;',
    'the work is planned;',
    'the work is implemented;',
    'an independent review happens when the change justifies it;',
    'a human decides;',
    'the change merges.',
  ],
  workflowRoles:
    "ChatGPT tends to sit early in that shape — requirements and architecture discussion, before an Issue exists. Claude Code turns an Issue into a plan and into code. Codex can step in as an independent reviewer, kept separate from whoever implemented the change. Independent review is selective, not a step every change goes through, and it never replaces the human decision — it's input to it, same as any other review would be.",
  governanceTitle: 'Decision records / governance',
  governance:
    "Architectural decisions meant to outlive the change that prompted them are written down as decision records — problem, decision, and trade-offs, in one place. An accepted record isn't quietly rewritten to change what history says; when a decision needs to change, a new record supersedes it explicitly instead.",
  boundariesTitle: 'Boundaries',
  boundariesLead:
    "What's deliberately absent today says as much about the architecture as what's present:",
  boundaries: [
    {
      title: 'No CMS',
      description: 'Content is versioned in the repository, not authored in an external system.',
    },
    {
      title: 'No database for static content',
      description:
        'Nothing here changes per request, so nothing here needs a database — that only enters if a real need for it shows up.',
    },
    {
      title: 'No generic collections framework',
      description:
        'Blog and Projects each keep their own small entry point instead of sharing a generalized abstraction that has no second concrete problem to solve yet.',
    },
    {
      title: 'No runtime content loading',
      description:
        'Nothing reads or parses content while serving a request — if build-time can resolve it, build-time does.',
    },
    {
      title: 'No abstractions ahead of need',
      description:
        'Structure is added when code demonstrates the need for it, not reserved in advance for a feature that doesn’t exist yet.',
    },
  ] as Entry[],
  home: '← Home',
}

const COPY: Record<Locale, typeof COPY_EN> = {
  en: COPY_EN,
  'pt-br': {
    title: 'Arquitetura',
    lead: 'Como o Developer OS é estruturado e quais princípios o mantêm simples conforme cresce.',
    overviewTitle: 'Visão geral da arquitetura',
    overview:
      'O Developer OS é uma única aplicação construída com TanStack Start, React e TypeScript. Ele é hospedado na Cloudflare e desenvolvido em aberto no GitHub, onde toda mudança é proposta, revisada e mergeada. O conteúdo que não precisa mudar a cada requisição — artigos, páginas de projeto, esta página — é processado uma única vez, em tempo de build, e publicado como artefato estático em vez de ser calculado a cada visita.',
    principlesTitle: 'Princípios centrais',
    principles: [
      {
        title: 'Simplicidade primeiro',
        description:
          'Vence a solução mais simples que atende ao requisito de hoje — infraestrutura e abstração esperam por uma necessidade concreta, não por uma hipotética.',
      },
      {
        title: 'Abstrações exigem um consumidor real',
        description:
          'Código compartilhado é extraído depois que aparece um segundo uso real, nunca em antecipação a ele. Três linhas parecidas são melhores que uma abstração prematura.',
      },
      {
        title: 'Build-time quando runtime é desnecessário',
        description:
          'O que pode ser resolvido uma vez, em tempo de build, é — processamento de conteúdo, validação e prerender acontecem antes de qualquer requisição existir.',
      },
      {
        title: 'Evolução incremental',
        description:
          'A estrutura cresce adicionando o que é necessário em seguida, não antecipando uma forma futura. Diretórios e camadas aparecem quando o código os justifica.',
      },
      {
        title: 'Decisões duráveis são registradas',
        description:
          'Trade-offs que devem sobreviver à próxima reescrita são escritos como registros de decisão, não deixados como conhecimento tácito na cabeça de alguém.',
      },
      {
        title: 'Legível por humanos e por fluxos assistidos por IA',
        description:
          'Nomes, estrutura e documentação são mantidos previsíveis e explícitos — legibilidade não é só para a próxima pessoa, é também para o próximo agente.',
      },
    ],
    contentTitle: 'Arquitetura de conteúdo',
    contentMarkdown:
      'Blog e Projetos são orientados a prosa, então ambos são escritos em Markdown e passam pelo mesmo pipeline exclusivo de build: descoberta, validação de frontmatter e processamento de Markdown são compartilhados, porque um segundo tipo de conteúdo real apareceu e justificou o compartilhamento. Cada tipo ainda mantém seu próprio ponto de entrada e sua própria saída, deliberadamente não fundidos num sistema genérico — ainda não existe um segundo problema que um framework genérico de coleções de fato resolveria. O resultado desse pipeline é um snapshot canônico e validado que alimenta tanto as páginas prerenderizadas quanto os dados que cada rota lê.',
    contentUses:
      'A página Ferramentas segue outro caminho. É uma lista curta e curada, sem corpo de prosa independente, então vive como dado estruturado e tipado que a própria rota importa diretamente — sem pipeline, sem etapa de validação além do verificador de tipos.',
    markdownDiagram: {
      entries: 'entradas em Markdown',
      pipeline: 'pipeline de build',
      snapshot: 'snapshot canônico',
      prerender: 'prerender',
      routes: 'módulo virtual → rotas',
    },
    usesDiagram: {
      uses: 'Ferramentas',
      data: 'dados tipados em TypeScript',
      route: 'importados diretamente pela rota',
    },
    contentClosing:
      'Nenhum dos dois caminhos é generalizado além disso — um framework genérico de conteúdo estaria resolvendo um problema que o projeto ainda não tem.',
    workflowTitle: 'Fluxo de desenvolvimento assistido por IA',
    workflowLead:
      'Toda mudança não trivial segue o mesmo formato, não importa quem — ou o quê — escreve o código:',
    workflowSteps: [
      'um problema aparece;',
      'requisitos e arquitetura são discutidos antes de qualquer coisa ser construída;',
      'essa discussão vira uma Issue — o contrato do trabalho;',
      'o trabalho é planejado;',
      'o trabalho é implementado;',
      'uma revisão independente acontece quando a mudança justifica;',
      'um humano decide;',
      'a mudança é mergeada.',
    ],
    workflowRoles:
      'O ChatGPT costuma ficar no começo desse formato — discussão de requisitos e de arquitetura, antes de existir uma Issue. O Claude Code transforma uma Issue em plano e em código. O Codex pode entrar como revisor independente, mantido separado de quem implementou a mudança. A revisão independente é seletiva, não uma etapa pela qual toda mudança passa, e nunca substitui a decisão humana — é insumo para ela, como qualquer outra revisão seria.',
    governanceTitle: 'Registros de decisão / governança',
    governance:
      'Decisões arquiteturais feitas para durar além da mudança que as motivou são escritas como registros de decisão — problema, decisão e trade-offs, num só lugar. Um registro aceito não é reescrito em silêncio para mudar o que a história diz; quando uma decisão precisa mudar, um novo registro a substitui explicitamente.',
    boundariesTitle: 'Limites',
    boundariesLead:
      'O que está deliberadamente ausente hoje diz tanto sobre a arquitetura quanto o que está presente:',
    boundaries: [
      {
        title: 'Sem CMS',
        description: 'O conteúdo é versionado no repositório, não escrito num sistema externo.',
      },
      {
        title: 'Sem banco de dados para conteúdo estático',
        description:
          'Nada aqui muda a cada requisição, então nada aqui precisa de banco de dados — ele só entra se aparecer uma necessidade real.',
      },
      {
        title: 'Sem framework genérico de coleções',
        description:
          'Blog e Projetos mantêm cada um seu pequeno ponto de entrada, em vez de compartilhar uma abstração generalizada que ainda não tem um segundo problema concreto para resolver.',
      },
      {
        title: 'Sem carregamento de conteúdo em runtime',
        description:
          'Nada lê nem interpreta conteúdo enquanto atende uma requisição — se o build consegue resolver, o build resolve.',
      },
      {
        title: 'Sem abstrações antes da necessidade',
        description:
          'Estrutura é adicionada quando o código demonstra a necessidade, não reservada de antemão para uma funcionalidade que ainda não existe.',
      },
    ],
    home: '← Início',
  },
}

export function architectureTitle(locale: Locale): string {
  return COPY[locale].title
}

export function ArchitecturePage({ locale }: Readonly<{ locale: Locale }>) {
  const copy = COPY[locale]

  return (
    <main className="relative isolate mx-auto flex min-h-screen max-w-2xl flex-col gap-12 px-6 py-16">
      <div aria-hidden="true" className="page-backdrop" />
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">{copy.lead}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{copy.overviewTitle}</h2>
        <p className="text-muted-foreground">{copy.overview}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{copy.principlesTitle}</h2>
        <dl className="space-y-4">
          {copy.principles.map((principle) => (
            <div key={principle.title}>
              <dt className="font-semibold">{principle.title}</dt>
              <dd className="text-muted-foreground">{principle.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{copy.contentTitle}</h2>
        <p className="text-muted-foreground">{copy.contentMarkdown}</p>
        <p className="text-muted-foreground">{copy.contentUses}</p>
        <div className="flex flex-col items-center gap-1 py-4 font-mono text-sm text-muted-foreground">
          <span>{copy.markdownDiagram.entries}</span>
          <span aria-hidden="true">↓</span>
          <span>{copy.markdownDiagram.pipeline}</span>
          <span aria-hidden="true">↓</span>
          <span>{copy.markdownDiagram.snapshot}</span>
          <span aria-hidden="true">↓</span>
          <span className="flex flex-col items-start gap-1">
            <span>
              <span aria-hidden="true">├── </span>
              {copy.markdownDiagram.prerender}
            </span>
            <span>
              <span aria-hidden="true">└── </span>
              {copy.markdownDiagram.routes}
            </span>
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 py-4 font-mono text-sm text-muted-foreground">
          <span>{copy.usesDiagram.uses}</span>
          <span aria-hidden="true">↓</span>
          <span>{copy.usesDiagram.data}</span>
          <span aria-hidden="true">↓</span>
          <span>{copy.usesDiagram.route}</span>
        </div>
        <p className="text-muted-foreground">{copy.contentClosing}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{copy.workflowTitle}</h2>
        <p className="text-muted-foreground">{copy.workflowLead}</p>
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          {copy.workflowSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="text-muted-foreground">{copy.workflowRoles}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{copy.governanceTitle}</h2>
        <p className="text-muted-foreground">{copy.governance}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{copy.boundariesTitle}</h2>
        <p className="text-muted-foreground">{copy.boundariesLead}</p>
        <ul className="space-y-4">
          {copy.boundaries.map((boundary) => (
            <li key={boundary.title}>
              <p className="font-medium">{boundary.title}</p>
              <p className="text-muted-foreground">{boundary.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <Link to={localePrefix(locale) || '/'} className="text-sm text-muted-foreground hover:text-foreground">
        {copy.home}
      </Link>
    </main>
  )
}
