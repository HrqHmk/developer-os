import { createFileRoute } from '@tanstack/react-router'
import { AboutPage, aboutTitle } from '../components/about-page'
import { pageHead } from '../lib/site-metadata.ts'

export const Route = createFileRoute('/about')({
  head: () => pageHead('/about', aboutTitle('en')),
  component: () => <AboutPage locale="en" />,
})
