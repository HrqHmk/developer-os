import { Link } from '@tanstack/react-router'
import type { CompiledArticle } from '../content/pipeline/build-articles.ts'
import { NewsletterSignup } from './newsletter-signup.tsx'
import { formatPublishedAt } from '../lib/format-published-at.ts'
import { localePrefix, type Locale } from '../lib/locale'

const COPY: Record<Locale, { back: string }> = {
  en: { back: '← Blog' },
  'pt-br': { back: '← Blog' },
}

export function BlogArticlePage({
  locale,
  article,
}: Readonly<{ locale: Locale; article: CompiledArticle }>) {
  return (
    <main className="relative isolate mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div aria-hidden="true" className="page-backdrop" />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold sm:text-4xl">{article.title}</h1>
        <p className="text-sm text-muted-foreground">
          {formatPublishedAt(article.publishedAt, locale)}
        </p>
      </div>
      {/* Safe here: `html` is build-time output of the project's own content
          pipeline (versioned Markdown, validated in build), never user input. */}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: article.html }} />
      <NewsletterSignup locale={locale} />
      <Link to={`${localePrefix(locale)}/blog`} className="text-sm text-muted-foreground hover:text-foreground">
        {COPY[locale].back}
      </Link>
    </main>
  )
}
