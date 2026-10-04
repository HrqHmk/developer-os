import { createFileRoute } from '@tanstack/react-router'
import { ArchitecturePage, architectureTitle } from '../components/architecture-page'
import { pageHead } from '../lib/site-metadata.ts'

export const Route = createFileRoute('/architecture')({
  head: () => pageHead('/architecture', `${architectureTitle('en')} — Developer OS`),
  component: () => <ArchitecturePage locale="en" />,
})
