import { createFileRoute } from '@tanstack/react-router'
import { UsesPage, usesTitle } from '../components/uses-page'
import { pageHead } from '../lib/site-metadata.ts'

export const Route = createFileRoute('/uses')({
  head: () => pageHead('/uses', `${usesTitle('en')} — Developer OS`),
  component: () => <UsesPage locale="en" />,
})
