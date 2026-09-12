import { describe, expect, it } from 'vitest'
import type { SearchDocument } from '../content/pipeline/search-index'
import { searchDocuments } from './search'

/** A document with only the fields a case cares about; the rest are empty. */
function doc(fields: Partial<SearchDocument> & { slug: string }): SearchDocument {
  return { type: 'article', title: '', description: '', body: '', ...fields }
}

const slugsOf = (documents: readonly SearchDocument[]) => documents.map((d) => d.slug)

describe('searchDocuments — query normalization', () => {
  const documents = [doc({ slug: 'a', title: 'Developer OS' })]

  it('returns nothing for an empty or whitespace-only query', () => {
    expect(searchDocuments(documents, '')).toEqual([])
    expect(searchDocuments(documents, '   ')).toEqual([])
    expect(searchDocuments(documents, '\t\n ')).toEqual([])
  })

  it('is case-insensitive and ignores surrounding whitespace', () => {
    expect(slugsOf(searchDocuments(documents, '  DEVELOPER  '))).toEqual(['a'])
  })

  it('matches on a substring, not only on whole words', () => {
    expect(slugsOf(searchDocuments(documents, 'velop'))).toEqual(['a'])
  })

  it('returns nothing when no document matches', () => {
    expect(searchDocuments(documents, 'absent')).toEqual([])
  })
})

describe('searchDocuments — which fields are searched', () => {
  it('searches title, description and body', () => {
    const documents = [
      doc({ slug: 'by-title', title: 'alpha' }),
      doc({ slug: 'by-description', description: 'alpha' }),
      doc({ slug: 'by-body', body: 'alpha' }),
    ]

    expect(slugsOf(searchDocuments(documents, 'alpha')).sort()).toEqual([
      'by-body',
      'by-description',
      'by-title',
    ])
  })

  it('does not search the slug', () => {
    expect(searchDocuments([doc({ slug: 'alpha-slug' })], 'alpha')).toEqual([])
  })
})

describe('searchDocuments — multi-word queries', () => {
  it('requires every token to match (AND, not OR)', () => {
    const documents = [
      doc({ slug: 'both', title: 'alpha', body: 'beta' }),
      doc({ slug: 'only-one', title: 'alpha' }),
    ]

    expect(slugsOf(searchDocuments(documents, 'alpha beta'))).toEqual(['both'])
  })

  it('treats a repeated token exactly like a single one', () => {
    // Without deduplication `alpha` would be scored twice, and these two
    // documents would come back in the opposite order: 1+1+3 = 5 for
    // `title-and-body` against 2+2+2 = 6 for `description-twice`.
    const documents = [
      doc({ slug: 'title-and-body', title: 'beta', body: 'alpha' }),
      doc({ slug: 'description-twice', description: 'alpha and beta' }),
    ]

    expect(searchDocuments(documents, 'alpha alpha beta')).toEqual(
      searchDocuments(documents, 'alpha beta'),
    )
    expect(slugsOf(searchDocuments(documents, 'alpha alpha beta'))).toEqual([
      'title-and-body',
      'description-twice',
    ])
  })
})

describe('searchDocuments — ranking', () => {
  it('ranks a title match above a description match above a body match', () => {
    const documents = [
      doc({ slug: 'by-body', body: 'alpha' }),
      doc({ slug: 'by-title', title: 'alpha' }),
      doc({ slug: 'by-description', description: 'alpha' }),
    ]

    expect(slugsOf(searchDocuments(documents, 'alpha'))).toEqual([
      'by-title',
      'by-description',
      'by-body',
    ])
  })

  it('keeps index order for ties, so ordering stays deterministic', () => {
    const first = doc({ slug: 'first', title: 'alpha' })
    const second = doc({ slug: 'second', title: 'alpha' })

    expect(slugsOf(searchDocuments([first, second], 'alpha'))).toEqual(['first', 'second'])
    expect(slugsOf(searchDocuments([second, first], 'alpha'))).toEqual(['second', 'first'])
  })

  it('scores two tokens as an aggregate, leaving title and description tied', () => {
    // 3 + 1 against 2 + 2. Documented property of the v1 algorithm: the
    // weighting is a sum, so it does not make title dominate field by
    // field. Reversing the input reverses the output, which is what proves
    // this is a tie rather than a win for either side.
    const titleAndBody = doc({ slug: 'title-and-body', title: 'alpha', body: 'beta' })
    const descriptionOnly = doc({ slug: 'description-only', description: 'alpha beta' })

    expect(slugsOf(searchDocuments([titleAndBody, descriptionOnly], 'alpha beta'))).toEqual([
      'title-and-body',
      'description-only',
    ])
    expect(slugsOf(searchDocuments([descriptionOnly, titleAndBody], 'alpha beta'))).toEqual([
      'description-only',
      'title-and-body',
    ])
  })

  it('lets three description matches outrank a set containing a title match', () => {
    // 2 x 3 = 6 against 3 + 1 + 1 = 5. The second document wins despite
    // being listed first and despite the other's title match — the
    // documented consequence of aggregate scoring (Issue #48).
    const documents = [
      doc({ slug: 'title-and-two-body', title: 'alpha', body: 'beta gamma' }),
      doc({ slug: 'description-thrice', description: 'alpha beta gamma' }),
    ]

    expect(slugsOf(searchDocuments(documents, 'alpha beta gamma'))).toEqual([
      'description-thrice',
      'title-and-two-body',
    ])
  })
})
