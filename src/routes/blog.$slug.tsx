import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { articles } from 'virtual:articles'

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug)
    if (!article) throw notFound()
    return article
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.title} — Developer OS` }] : [],
  }),
  component: BlogArticle,
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function BlogArticle() {
  const article = Route.useLoaderData()

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold sm:text-4xl">{article.title}</h1>
        <p className="text-sm text-muted-foreground">{formatDate(article.publishedAt)}</p>
      </div>
      {/* Safe here: `html` is build-time output of the project's own content
          pipeline (versioned Markdown, validated in build), never user input. */}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: article.html }} />
      <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">
        ← Blog
      </Link>
    </main>
  )
}
