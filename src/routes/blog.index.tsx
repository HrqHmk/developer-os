import { createFileRoute } from '@tanstack/react-router'
import { articles } from 'virtual:articles'
import { BlogIndexPage } from '../components/blog-index-page'
import { pageHead } from '../lib/site-metadata.ts'

export const Route = createFileRoute('/blog/')({
  head: () => pageHead('/blog', 'Blog — Developer OS'),
  component: () => <BlogIndexPage locale="en" articles={articles.en} />,
})
