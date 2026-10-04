import { createFileRoute } from '@tanstack/react-router'
import { projects } from 'virtual:projects'
import { articles } from 'virtual:articles'
import { HomePage } from '../../components/home-page'
import { homeHeadFor } from '../../lib/site-metadata.ts'

export const Route = createFileRoute('/pt-br/')({
  head: () => homeHeadFor('pt-br'),
  component: () => (
    <HomePage locale="pt-br" projects={projects['pt-br']} articles={articles['pt-br']} />
  ),
})
