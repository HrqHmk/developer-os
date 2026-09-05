import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/architecture')({
  head: () => ({
    meta: [{ title: 'Architecture — Developer OS' }],
  }),
  component: Architecture,
})

const corePrinciples = [
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
]

const boundaries = [
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
]

function Architecture() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-12 px-6 py-16">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">Architecture</h1>
        <p className="text-lg text-muted-foreground">
          How Developer OS is structured, and what principles keep it simple as it grows.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Architecture overview</h2>
        <p className="text-muted-foreground">
          Developer OS is a single application built with TanStack Start, React and TypeScript.
          It's hosted on Cloudflare and developed in the open on GitHub, where every change is
          proposed, reviewed and merged. Content that doesn't need to change per request —
          articles, project pages, this page — is processed once, at build time, and shipped as a
          static artifact rather than computed on every visit.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Core principles</h2>
        <dl className="space-y-4">
          {corePrinciples.map((principle) => (
            <div key={principle.title}>
              <dt className="font-semibold">{principle.title}</dt>
              <dd className="text-muted-foreground">{principle.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Content architecture</h2>
        <p className="text-muted-foreground">
          Blog and Projects are prose-driven, so both are written in Markdown and go through the
          same build-only pipeline: discovery, frontmatter validation and Markdown processing are
          shared, because a second real content type showed up and justified sharing them. Each
          type still keeps its own entry point and its own output, deliberately not merged into
          one generic system — there's no second problem yet that a generic collections framework
          would actually solve. The result of that pipeline is a canonical, validated snapshot
          that feeds both the prerendered pages and the data each route reads from.
        </p>
        <p className="text-muted-foreground">
          Uses takes a different path. It's a short, curated list with no independent prose body,
          so it lives as typed, structured data that its route imports directly — no pipeline, no
          validation step beyond the type checker.
        </p>
        <div className="flex flex-col items-center gap-1 py-4 font-mono text-sm text-muted-foreground">
          <span>Markdown entries</span>
          <span aria-hidden="true">↓</span>
          <span>build pipeline</span>
          <span aria-hidden="true">↓</span>
          <span>canonical snapshot</span>
          <span aria-hidden="true">↓</span>
          <span className="flex flex-col items-start gap-1">
            <span>
              <span aria-hidden="true">├── </span>prerender
            </span>
            <span>
              <span aria-hidden="true">└── </span>virtual module → routes
            </span>
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 py-4 font-mono text-sm text-muted-foreground">
          <span>Uses</span>
          <span aria-hidden="true">↓</span>
          <span>typed TypeScript data</span>
          <span aria-hidden="true">↓</span>
          <span>imported directly by the route</span>
        </div>
        <p className="text-muted-foreground">
          Neither path is generalized further than this — a generic content framework would be
          solving a problem the project doesn't have yet.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">AI-assisted development workflow</h2>
        <p className="text-muted-foreground">
          Every non-trivial change follows the same shape, regardless of who — or what — writes
          the code:
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>a problem shows up;</li>
          <li>requirements and architecture get discussed before anything is built;</li>
          <li>that discussion becomes an Issue — the contract for the work;</li>
          <li>the work is planned;</li>
          <li>the work is implemented;</li>
          <li>an independent review happens when the change justifies it;</li>
          <li>a human decides;</li>
          <li>the change merges.</li>
        </ol>
        <p className="text-muted-foreground">
          ChatGPT tends to sit early in that shape — requirements and architecture discussion,
          before an Issue exists. Claude Code turns an Issue into a plan and into code. Codex can
          step in as an independent reviewer, kept separate from whoever implemented the change.
          Independent review is selective, not a step every change goes through, and it never
          replaces the human decision — it's input to it, same as any other review would be.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Decision records / governance</h2>
        <p className="text-muted-foreground">
          Architectural decisions meant to outlive the change that prompted them are written down
          as decision records — problem, decision, and trade-offs, in one place. An accepted
          record isn't quietly rewritten to change what history says; when a decision needs to
          change, a new record supersedes it explicitly instead.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Boundaries</h2>
        <p className="text-muted-foreground">
          What's deliberately absent today says as much about the architecture as what's present:
        </p>
        <ul className="space-y-4">
          {boundaries.map((boundary) => (
            <li key={boundary.title}>
              <p className="font-medium">{boundary.title}</p>
              <p className="text-muted-foreground">{boundary.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Home
      </Link>
    </main>
  )
}
