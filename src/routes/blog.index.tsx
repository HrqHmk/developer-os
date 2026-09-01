import { Link, createFileRoute } from '@tanstack/react-router'
import { articles } from 'virtual:articles'

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: [{ title: 'Blog — Developer OS' }],
  }),
  component: Blog,
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function Blog() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">Blog</h1>
      <ul className="space-y-8">
        {articles.map((article) => (
          <li key={article.slug} className="space-y-2">
            <Link to="/blog/$slug" params={{ slug: article.slug }} className="block space-y-2">
              <h2 className="text-xl font-semibold hover:text-foreground">{article.title}</h2>
              <p className="text-muted-foreground">{article.description}</p>
              <p className="text-sm text-muted-foreground">{formatDate(article.publishedAt)}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Home
      </Link>
    </main>
  )
}
