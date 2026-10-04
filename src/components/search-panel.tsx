import { useId, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { SearchDocument } from '../content/pipeline/search-index.ts'
import { searchDocuments } from '../lib/search.ts'
import { localePrefix, type Locale } from '../lib/locale.ts'

const COPY_EN = {
  title: 'Search',
  label: 'Search Blog articles and Projects',
  empty: 'Type to search Blog articles and Projects.',
  noResults: (query: string) => `No results for “${query}”.`,
  home: '← Home',
  types: { article: 'Blog', project: 'Project' } satisfies Record<SearchDocument['type'], string>,
}

const COPY: Record<Locale, typeof COPY_EN> = {
  en: COPY_EN,
  'pt-br': {
    title: 'Busca',
    label: 'Buscar artigos do Blog e Projetos',
    empty: 'Digite para buscar artigos do Blog e Projetos.',
    noResults: (query: string) => `Nenhum resultado para “${query}”.`,
    home: '← Início',
    types: { article: 'Blog', project: 'Projeto' },
  },
}

/**
 * The whole `/search` experience (Issue #48). It takes the index as a prop
 * rather than importing `virtual:search-index` itself: that import belongs
 * to the route, which keeps this component testable without the Vite
 * plugin chain, and keeps the test's input a fixed set rather than the
 * real site content.
 *
 * Search runs as you type, undebounced: it is a pure function over an
 * in-memory array, so a timer and its cleanup would be machinery for a
 * problem that does not exist.
 *
 * `documents` is the index of one language and `locale` that language
 * (Issue #83): results link within it and are never mixed with the other.
 */
export function SearchPanel({
  documents,
  locale = 'en',
}: Readonly<{ documents: SearchDocument[]; locale?: Locale }>) {
  const copy = COPY[locale]
  const inputId = useId()
  const [query, setQuery] = useState('')

  const hasQuery = query.trim() !== ''
  const results = searchDocuments(documents, query)

  return (
    <main className="relative isolate mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div aria-hidden="true" className="page-backdrop page-backdrop-listing" />
      <h1 className="text-3xl font-bold sm:text-4xl">{copy.title}</h1>

      <div className="space-y-2">
        <label htmlFor={inputId} className="block text-sm text-muted-foreground">
          {copy.label}
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          className="w-full border border-muted-foreground bg-background px-3 py-2 text-foreground"
        />
      </div>

      {/* Announced politely: results change as the visitor types, with no
          submit event to signal the update to a screen reader. */}
      <div aria-live="polite">
        {!hasQuery && (
          <p className="text-muted-foreground">{copy.empty}</p>
        )}

        {hasQuery && results.length === 0 && (
          <p className="text-muted-foreground">{copy.noResults(query.trim())}</p>
        )}

        {hasQuery && results.length > 0 && (
          <ul className="space-y-8">
            {results.map((result) => (
              <li key={`${result.type}/${result.slug}`} className="space-y-2">
                <SearchResultLink result={result} locale={locale}>
                  <h2 className="text-xl font-semibold hover:text-foreground">{result.title}</h2>
                  <p className="text-muted-foreground">{result.description}</p>
                  <p className="text-sm text-muted-foreground">{copy.types[result.type]}</p>
                </SearchResultLink>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link to={localePrefix(locale) || '/'} className="text-sm text-muted-foreground hover:text-foreground">
        {copy.home}
      </Link>
    </main>
  )
}

/**
 * Two branches rather than one interpolated string: `<Link>` keeps its URL
 * type-checked only when the route path is a literal, which is how every
 * other route in the app links to content.
 */
function SearchResultLink({
  result,
  locale,
  children,
}: Readonly<{ result: SearchDocument; locale: Locale; children: React.ReactNode }>) {
  const className = 'block space-y-2'
  const prefix = localePrefix(locale)

  return result.type === 'article' ? (
    <Link to={`${prefix}/blog/$slug`} params={{ slug: result.slug }} className={className}>
      {children}
    </Link>
  ) : (
    <Link to={`${prefix}/projects/$slug`} params={{ slug: result.slug }} className={className}>
      {children}
    </Link>
  )
}
