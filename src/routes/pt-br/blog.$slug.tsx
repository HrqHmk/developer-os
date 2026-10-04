import { createFileRoute, notFound } from '@tanstack/react-router'
import { articles } from 'virtual:articles'
import { BlogArticlePage } from '../../components/blog-article-page'
import { pageHead } from '../../lib/site-metadata.ts'

export const Route = createFileRoute('/pt-br/blog/$slug')({
  loader: ({ params }) => {
    const article = articles['pt-br'].find((a) => a.slug === params.slug)
    if (!article) throw notFound()
    return article
  },
  head: ({ loaderData, params }) =>
    loaderData ? pageHead(`/blog/${params.slug}`, `${loaderData.title} — Developer OS`) : {},
  component: function BlogArticle() {
    return <BlogArticlePage locale="pt-br" article={Route.useLoaderData()} />
  },
})
