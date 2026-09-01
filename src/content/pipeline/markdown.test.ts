import { describe, expect, it } from 'vitest'
import { toHtml } from './markdown'

describe('toHtml', () => {
  it('renders headings, emphasis, links, and fenced code blocks as plain HTML', () => {
    const html = toHtml(
      [
        '## Heading',
        '',
        'A paragraph with **bold** text and a [link](https://example.com).',
        '',
        '```txt',
        'plain code',
        '```',
      ].join('\n'),
    )

    expect(html).toContain('<h2>Heading</h2>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<a href="https://example.com">link</a>')
    expect(html).toContain('<pre><code class="language-txt">plain code')
  })

  it('rejects a Markdown body containing an inline raw HTML tag (P9)', () => {
    expect(() => toHtml('A paragraph with <strong>raw HTML</strong> inline.')).toThrow(
      /raw html is not allowed/i,
    )
  })

  it('rejects a Markdown body containing a raw HTML block (P9)', () => {
    expect(() => toHtml('<div>A raw HTML block.</div>')).toThrow(/raw html is not allowed/i)
  })
})
