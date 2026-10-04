import { createFileRoute } from '@tanstack/react-router'
import { changelogEntries } from 'virtual:changelog'
import { ChangelogPage, changelogTitle } from '../components/changelog-page'
import { pageHead } from '../lib/site-metadata.ts'

export const Route = createFileRoute('/changelog')({
  head: () => pageHead('/changelog', `${changelogTitle('en')} — Developer OS`),
  component: () => <ChangelogPage locale="en" entries={changelogEntries.en} />,
})
