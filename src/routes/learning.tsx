import { Link, createFileRoute } from '@tanstack/react-router'
import { learningSections } from '../content/data/learning.ts'

export const Route = createFileRoute('/learning')({
  head: () => ({
    meta: [{ title: 'Learning — Developer OS' }],
  }),
  component: Learning,
})

function Learning() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-12 px-6 py-16">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">Learning</h1>
        <p className="text-lg text-muted-foreground">
          Learning tracks what I'm actively studying and in which direction I'm developing as an
          engineer — the process, not the finished result. Blog is where a topic becomes a
          synthesis once it's worked through; Projects is where it gets applied; Changelog is
          what changed in Developer OS itself. Learning is what's still in progress.
        </p>
      </div>
      {learningSections.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <ul className="space-y-4">
            {section.items.map((item) => (
              <li key={item.topic}>
                <p className="font-medium">{item.topic}</p>
                <p className="text-muted-foreground">{item.description}</p>
                {item.focus && <p className="text-muted-foreground">{item.focus}</p>}
                {item.articleSlug && (
                  <Link
                    to="/blog/$slug"
                    params={{ slug: item.articleSlug }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Related article →
                  </Link>
                )}
                {item.projectSlug && (
                  <Link
                    to="/projects/$slug"
                    params={{ slug: item.projectSlug }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Related project →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Learning philosophy</h2>
        <p className="text-muted-foreground">
          Learning here isn't a course list or a progress bar. There's no percentage complete, no
          certificate, no streak to keep. A topic stays on this page for as long as it's actively
          shaping decisions in Developer OS, and moves to "recently explored" once it's settled
          into working knowledge instead of an open question — or graduates into a Blog post once
          there's a synthesis worth writing down.
        </p>
      </section>
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Home
      </Link>
    </main>
  )
}
