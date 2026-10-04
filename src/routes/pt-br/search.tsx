import { createFileRoute } from '@tanstack/react-router'
import { searchIndex } from 'virtual:search-index'
import { SearchPanel } from '../../components/search-panel.tsx'
import { pageHead } from '../../lib/site-metadata.ts'

// The only modules that import the search index are the two Search routes.
// Keeping that import here, rather than inside SearchPanel, is what confines
// the index payload to this route's chunk and what lets the component be
// tested without the build-time plugin chain (Issue #48). Each route hands
// SearchPanel only its own language's index (Issue #83).
export const Route = createFileRoute('/pt-br/search')({
  head: () => pageHead('/search', 'Busca — Developer OS'),
  component: () => <SearchPanel locale="pt-br" documents={searchIndex['pt-br']} />,
})
