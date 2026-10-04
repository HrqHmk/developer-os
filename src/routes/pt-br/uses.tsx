import { createFileRoute } from '@tanstack/react-router'
import { UsesPage, usesTitle } from '../../components/uses-page'
import { pageHead } from '../../lib/site-metadata.ts'

export const Route = createFileRoute('/pt-br/uses')({
  head: () => pageHead('/uses', `${usesTitle('pt-br')} — Developer OS`),
  component: () => <UsesPage locale="pt-br" />,
})
