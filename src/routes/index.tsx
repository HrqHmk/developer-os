import { createFileRoute } from '@tanstack/react-router'
import { projects } from 'virtual:projects'
import { articles } from 'virtual:articles'
import { HomePage } from '../components/home-page'
import { homeHeadFor } from '../lib/site-metadata.ts'

export const Route = createFileRoute('/')({
  head: () => homeHeadFor('en'),
  component: () => <HomePage locale="en" projects={projects.en} articles={articles.en} />,
})
