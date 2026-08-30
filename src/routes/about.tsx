import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [{ title: 'About Developer OS' }],
  }),
  component: About,
})

function About() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">About Developer OS</h1>
        <p className="text-lg text-muted-foreground">
          Developer OS is a public engineering lab, not a portfolio. It's where I design,
          build, and document real software — including how I work with AI agents to do it.
        </p>
        <p className="text-lg text-muted-foreground">
          Every architectural decision, convention, and trade-off lives here in the open: as
          documentation before code, as an issue before a branch, as a diff a human reviews
          before it ships. The goal isn't just to show what got built, but how — and why.
        </p>
      </div>
      <dl className="space-y-4">
        <div>
          <dt className="font-semibold">Engineering</dt>
          <dd className="text-muted-foreground">
            Decisions are specified and documented before they're implemented.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">AI orchestration</dt>
          <dd className="text-muted-foreground">
            AI agents write and review code here; a human validates architecture and quality.
          </dd>
        </div>
        <div>
          <dt className="font-semibold">Learning in public</dt>
          <dd className="text-muted-foreground">
            Progress, mistakes, and revisions stay visible instead of being polished away.
          </dd>
        </div>
      </dl>
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Home
      </Link>
    </main>
  )
}
