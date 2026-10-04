import { createFileRoute } from '@tanstack/react-router'
import { changelogEntries } from 'virtual:changelog'
import { ChangelogPage, changelogTitle } from '../../components/changelog-page'
import { pageHead } from '../../lib/site-metadata.ts'

export const Route = createFileRoute('/pt-br/changelog')({
  head: () => pageHead('/changelog', `${changelogTitle('pt-br')} — Developer OS`),
  component: () => <ChangelogPage locale="pt-br" entries={changelogEntries['pt-br']} />,
})
