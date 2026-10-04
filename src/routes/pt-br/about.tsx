import { createFileRoute } from '@tanstack/react-router'
import { AboutPage, aboutTitle } from '../../components/about-page'
import { pageHead } from '../../lib/site-metadata.ts'

export const Route = createFileRoute('/pt-br/about')({
  head: () => pageHead('/about', aboutTitle('pt-br')),
  component: () => <AboutPage locale="pt-br" />,
})
