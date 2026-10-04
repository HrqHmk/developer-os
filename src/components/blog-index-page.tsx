import { Link } from '@tanstack/react-router'
import type { CompiledArticle } from '../content/pipeline/build-articles.ts'
import { formatPublishedAt } from '../lib/format-published-at.ts'
import { localePrefix, type Locale } from '../lib/locale'

const COPY: Record<Locale, { title: string; home: string }> = {
  en: { title: 'Blog', home: '← Home' },
  'pt-br': { title: 'Blog', home: '← Início' },
}

export function BlogIndexPage({
  locale,
  articles,
}: Readonly<{ locale: Locale; articles: CompiledArticle[] }>) {
  const copy = COPY[locale]
  const prefix = localePrefix(locale)

  return (
    <main className="relative isolate mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div aria-hidden="true" className="page-backdrop page-backdrop-listing" />
      <h1 className="text-3xl font-bold sm:text-4xl">{copy.title}</h1>
      <ul className="space-y-8">
        {articles.map((article) => (
          <li key={article.slug} className="space-y-2">
            <Link to={`${prefix}/blog/$slug`} params={{ slug: article.slug }} className="block space-y-2">
              <h2 className="text-xl font-semibold hover:text-foreground">{article.title}</h2>
              <p className="text-muted-foreground">{article.description}</p>
              <p className="text-sm text-muted-foreground">
                {formatPublishedAt(article.publishedAt, locale)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <Link to={prefix || '/'} className="text-sm text-muted-foreground hover:text-foreground">
        {copy.home}
      </Link>
    </main>
  )
}
