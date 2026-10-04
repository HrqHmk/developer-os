import { Link } from '@tanstack/react-router'
import type { CompiledChangelogEntry } from '../content/pipeline/build-changelog.ts'
import { formatPublishedAt } from '../lib/format-published-at.ts'
import { localePrefix, type Locale } from '../lib/locale'

const COPY_EN = {
  title: 'Changelog',
  lead: 'Changelog records what changed in Developer OS. Blog explores why something matters, what was learned, or how we think about a given topic.',
  empty: 'No entries yet.',
  home: '← Home',
}

const COPY: Record<Locale, typeof COPY_EN> = {
  en: COPY_EN,
  'pt-br': {
    title: 'Changelog',
    lead: 'O Changelog registra o que mudou no Developer OS. O Blog explora por que algo importa, o que foi aprendido ou como pensamos sobre determinado tema.',
    empty: 'Nenhuma entrada ainda.',
    home: '← Início',
  },
}

export function changelogTitle(locale: Locale): string {
  return COPY[locale].title
}

export function ChangelogPage({
  locale,
  entries,
}: Readonly<{ locale: Locale; entries: CompiledChangelogEntry[] }>) {
  const copy = COPY[locale]

  return (
    <main className="relative isolate mx-auto flex min-h-screen max-w-2xl flex-col gap-12 px-6 py-16">
      <div aria-hidden="true" className="page-backdrop" />
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">{copy.lead}</p>
      </div>
      {entries.length === 0 ? (
        <p className="text-muted-foreground">{copy.empty}</p>
      ) : (
        <div className="space-y-12">
          {entries.map((entry) => (
            <section key={entry.slug} id={entry.slug} className="space-y-2">
              <h2 className="text-xl font-semibold">{entry.title}</h2>
              <time dateTime={entry.date} className="block text-sm text-muted-foreground">
                {formatPublishedAt(entry.date, locale)}
              </time>
              {/* Safe here: `html` is build-time output of the project's own content
                  pipeline (versioned Markdown, validated in build), never user input. */}
              <div className="article-body" dangerouslySetInnerHTML={{ __html: entry.html }} />
            </section>
          ))}
        </div>
      )}
      <Link to={localePrefix(locale) || '/'} className="text-sm text-muted-foreground hover:text-foreground">
        {copy.home}
      </Link>
    </main>
  )
}
