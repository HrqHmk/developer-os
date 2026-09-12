import { createFileRoute } from '@tanstack/react-router'
import { searchIndex } from 'virtual:search-index'
import { SearchPanel } from '../components/search-panel.tsx'

// The only module that imports the search index. Keeping that import here,
// rather than inside SearchPanel, is what confines the index payload to
// this route's chunk and what lets the component be tested without the
// build-time plugin chain (Issue #48).
export const Route = createFileRoute('/search')({
  head: () => ({
    meta: [{ title: 'Search — Developer OS' }],
  }),
  component: () => <SearchPanel documents={searchIndex} />,
})
