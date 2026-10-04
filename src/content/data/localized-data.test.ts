import { describe, expect, it } from 'vitest'
import { learningSections } from './learning'
import { usesSections } from './uses'

/**
 * The structured content modules hold one list per language (Issue #83).
 * Translation changes prose only: the shape, the order and every reference
 * (slugs, URLs, product names) must be identical, or one language would
 * silently show different content than the other.
 */
describe('learning parity', () => {
  it('has the same sections, items and references in both languages', () => {
    const shape = (sections: typeof learningSections.en) =>
      sections.map((section) =>
        section.items.map((item) => ({
          articleSlug: item.articleSlug,
          projectSlug: item.projectSlug,
          hasFocus: item.focus !== undefined,
        })),
      )
    expect(shape(learningSections['pt-br'])).toEqual(shape(learningSections.en))
  })
})

describe('uses parity', () => {
  it('lists the same tools, in the same order, with the same links', () => {
    const shape = (sections: typeof usesSections.en) =>
      sections.map((section) => section.items.map(({ name, href }) => ({ name, href })))
    expect(shape(usesSections['pt-br'])).toEqual(shape(usesSections.en))
  })
})
