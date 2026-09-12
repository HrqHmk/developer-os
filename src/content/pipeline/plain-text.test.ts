import { describe, expect, it } from 'vitest'
import { toHtml } from './markdown'
import { htmlToPlainText } from './plain-text'

/**
 * Every case starts from real Markdown and runs the real compiler. Feeding
 * hand-written HTML in would only assert a guess about what `toHtml()`
 * emits — and that guess is exactly what hid the inline-image defect during
 * planning: `<img>` is void, so "strip every tag" silently discarded the
 * authored `alt` text (Issue #48).
 */
function plainTextOf(markdown: string): string {
  return htmlToPlainText(toHtml(markdown))
}

describe('htmlToPlainText — inline images', () => {
  it('keeps the alt text inline, adding no separation of its own', () => {
    const text = plainTextOf('Text before ![the alt text](./x.png) text after.')

    expect(text).toBe('Text before the alt text text after.')
  })

  it('indexes no part of the image but its alt', () => {
    const text = plainTextOf('Text before ![the alt text](./x.png) text after.')

    expect(text).not.toContain('./x.png')
    expect(text).not.toContain('src')
    expect(text).not.toContain('img')
    expect(text).not.toContain('alt=')
  })

  it('keeps an image that is its own paragraph', () => {
    expect(plainTextOf('![A diagram of the pipeline](./diagram.png)')).toBe(
      'A diagram of the pipeline',
    )
  })

  it('contributes nothing for an empty alt', () => {
    expect(plainTextOf('![](./x.png)')).toBe('')
  })

  it('does not index an image title', () => {
    const text = plainTextOf('![alt here](./x.png "a title")')

    expect(text).toBe('alt here')
    expect(text).not.toContain('a title')
  })

  it('preserves the original inline adjacency, joining nothing the author separated', () => {
    // The author wrote no separator around the image, so none appears —
    // the same rule `a**alt**b` follows.
    expect(plainTextOf('a![alt](./x.png)b')).toBe('aaltb')
  })

  it('handles a literal > inside the alt without leaking markup', () => {
    const text = plainTextOf('![a > b](./x.png)')

    expect(text).toBe('a > b')
    expect(text).not.toContain('b">')
    expect(text).not.toContain('x.png')
  })
})

describe('htmlToPlainText — block and inline structure', () => {
  it('injects no space at an inline boundary', () => {
    expect(plainTextOf('Developer**OS** rocks')).toBe('DeveloperOS rocks')
  })

  it('separates nested list items at every level', () => {
    expect(plainTextOf('- a\n  - b\n    - c\n- d')).toBe('a b c d')
  })

  it('separates the paragraphs of a blockquote', () => {
    expect(plainTextOf('> quoted **text**\n>\n> second para')).toBe('quoted text second para')
  })

  it('separates the two halves of a hard break', () => {
    expect(plainTextOf('line one  \nline two')).toBe('line one line two')
  })

  it('keeps fenced code searchable without leaking the language class', () => {
    const text = plainTextOf('```js\nconst a = 1 > 0 && "x";\n```')

    expect(text).toBe('const a = 1 > 0 && "x";')
    expect(text).not.toContain('language-js')
    expect(text).not.toContain('class')
  })

  it('does not leak link markup, keeping only the link text', () => {
    const text = plainTextOf('See the [project page](https://example.com "the title").')

    expect(text).toBe('See the project page.')
    expect(text).not.toContain('https://example.com')
    expect(text).not.toContain('href')
    expect(text).not.toContain('the title')
  })
})

describe('htmlToPlainText — character references', () => {
  it('decodes the references the serializer emits', () => {
    expect(plainTextOf('AT&T and 5 < 6 and "q"')).toBe('AT&T and 5 < 6 and "q"')
  })

  it('decodes exactly once, so an escaped reference stays escaped', () => {
    // The author wrote a literal `&#x3C;p&gt;`; `toHtml()` escapes its `&`
    // into `&#x26;`. A second decoding pass would turn the result into `<p>`.
    const text = plainTextOf('&#x26;#x3C;p&#x26;gt;')

    expect(text).toBe('&#x3C;p&gt;')
  })

  it('returns an empty string for empty input', () => {
    expect(htmlToPlainText('')).toBe('')
  })
})
