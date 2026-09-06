import { Link, createFileRoute } from '@tanstack/react-router'
import { changelogEntries } from 'virtual:changelog'
import { formatPublishedAt } from '../lib/format-published-at.ts'

export const Route = createFileRoute('/changelog')({
  head: () => ({
    meta: [{ title: 'Changelog — Developer OS' }],
  }),
  component: Changelog,
})

function Changelog() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-12 px-6 py-16">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">Changelog</h1>
        <p className="text-lg text-muted-foreground">
          Changelog records what changed in Developer OS. Blog explores why something matters,
          what was learned, or how we think about a given topic.
        </p>
      </div>
      {changelogEntries.length === 0 ? (
        <p className="text-muted-foreground">No entries yet.</p>
      ) : (
        <div className="space-y-12">
          {changelogEntries.map((entry) => (
            <section key={entry.slug} id={entry.slug} className="space-y-2">
              <h2 className="text-xl font-semibold">{entry.title}</h2>
              <time dateTime={entry.date} className="block text-sm text-muted-foreground">
                {formatPublishedAt(entry.date)}
              </time>
              {/* Safe here: `html` is build-time output of the project's own content
                  pipeline (versioned Markdown, validated in build), never user input. */}
              <div className="article-body" dangerouslySetInnerHTML={{ __html: entry.html }} />
            </section>
          ))}
        </div>
      )}
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Home
      </Link>
    </main>
  )
}
