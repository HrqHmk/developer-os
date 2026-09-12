import { describe, expect, it } from 'vitest'
import { DOMParser, onErrorStopParsing } from '@xmldom/xmldom'
import type { Document as XmlDocument } from '@xmldom/xmldom'
import type { CompiledArticle } from './build-articles.ts'
import { type RssItemSource, toRssXml } from './rss.ts'

const baseUrl = 'https://example.test'

/**
 * The single parsing entry point every test below uses. By default
 * `@xmldom/xmldom` only throws on `fatalError`; `error`-level SAX reports
 * are merely logged unless `onError` is configured to escalate them. Test
 * 0 proves this configuration actually rejects malformed input.
 */
function parseRssXml(xml: string) {
  return new DOMParser({ onError: onErrorStopParsing }).parseFromString(xml, 'application/xml')
}

function textOf(doc: XmlDocument, tagName: string, index = 0): string {
  const node = doc.getElementsByTagName(tagName)[index]
  if (!node) throw new Error(`<${tagName}> not found at index ${index}`)
  return node.textContent ?? ''
}

const articleA: RssItemSource = {
  slug: 'why-im-building-developer-os',
  title: 'Why I Am Building Developer OS',
  description: 'What Developer OS is for.',
  publishedAt: '2026-01-01',
}

const articleB: RssItemSource = {
  slug: 'a-second-article',
  title: 'A Second Article',
  description: 'Another summary.',
  publishedAt: '2026-12-31',
}

describe('toRssXml', () => {
  it('rejects malformed XML — proves the parsing harness can fail', () => {
    const malformed = '<rss><channel><item><title>Unclosed</item></channel></rss>'
    expect(() => parseRssXml(malformed)).toThrow()
  })

  it('produces a well-formed document with correct channel metadata and item count', () => {
    const xml = toRssXml([articleA, articleB], baseUrl)
    const doc = parseRssXml(xml)

    expect(textOf(doc, 'title')).toBe('Developer OS')
    expect(textOf(doc, 'link')).toBe(`${baseUrl}/blog`)
    expect(textOf(doc, 'description')).toBe(
      'Engineering software. Orchestrating AI. Learning in public.',
    )
    expect(textOf(doc, 'language')).toBe('en')
    expect(doc.getElementsByTagName('item').length).toBe(2)
  })

  it('gives every item title/link/guid/pubDate/description, with link === guid and a permalink guid', () => {
    const xml = toRssXml([articleA], baseUrl)
    const doc = parseRssXml(xml)
    const item = doc.getElementsByTagName('item')[0]!

    const expectedUrl = `${baseUrl}/blog/${articleA.slug}`
    const link = item.getElementsByTagName('link')[0]!
    const guid = item.getElementsByTagName('guid')[0]!

    expect(link.textContent).toBe(expectedUrl)
    expect(guid.textContent).toBe(expectedUrl)
    expect(guid.getAttribute('isPermaLink')).toBe('true')
    expect(item.getElementsByTagName('title')[0]?.textContent).toBe(articleA.title)
    expect(item.getElementsByTagName('description')[0]?.textContent).toBe(articleA.description)
    expect(item.getElementsByTagName('pubDate')[0]?.textContent).toBeTruthy()
  })

  it('preserves input order without sorting', () => {
    // Deliberately not chronological/alphabetical: a naive re-sort by
    // `publishedAt` or `slug` would change this order.
    const outOfOrder = [articleB, articleA]
    const xml = toRssXml(outOfOrder, baseUrl)
    const doc = parseRssXml(xml)
    const links = Array.from(doc.getElementsByTagName('item')).map(
      (item) => item.getElementsByTagName('link')[0]?.textContent,
    )

    expect(links).toEqual([
      `${baseUrl}/blog/${articleB.slug}`,
      `${baseUrl}/blog/${articleA.slug}`,
    ])
  })

  it('escapes special characters without corrupting or double-escaping them', () => {
    const special: RssItemSource = {
      slug: 'special-characters',
      title: `Titles & "Quotes" <tags> 'apostrophes'`,
      description: `A & B < C > D "E" 'F'`,
      publishedAt: '2026-06-15',
    }
    const xml = toRssXml([special], baseUrl)

    // No bare `&` outside a valid entity — proves no raw ampersand leaked
    // and no double-escaping occurred.
    const bareAmpersands = xml.match(/&(?!amp;|lt;|gt;)/g)
    expect(bareAmpersands).toBeNull()

    const doc = parseRssXml(xml)
    const item = doc.getElementsByTagName('item')[0]!
    expect(item.getElementsByTagName('title')[0]?.textContent).toBe(special.title)
    expect(item.getElementsByTagName('description')[0]?.textContent).toBe(special.description)
  })

  it('converts publishedAt to an RFC-822 pubDate at UTC midnight, via the public serializer', () => {
    const jan1: RssItemSource = { ...articleA, publishedAt: '2026-01-01' }
    const dec31: RssItemSource = { ...articleA, slug: 'dec-31', publishedAt: '2026-12-31' }
    const xml = toRssXml([jan1, dec31], baseUrl)
    const doc = parseRssXml(xml)
    const items = doc.getElementsByTagName('item')

    expect(items[0]?.getElementsByTagName('pubDate')[0]?.textContent).toBe(
      'Thu, 01 Jan 2026 00:00:00 GMT',
    )
    expect(items[1]?.getElementsByTagName('pubDate')[0]?.textContent).toBe(
      'Thu, 31 Dec 2026 00:00:00 GMT',
    )
  })

  it('produces a valid, well-formed channel with zero items and no lastBuildDate for an empty feed', () => {
    const xml = toRssXml([], baseUrl)
    const doc = parseRssXml(xml)

    expect(doc.getElementsByTagName('channel').length).toBe(1)
    expect(doc.getElementsByTagName('item').length).toBe(0)
    expect(doc.getElementsByTagName('lastBuildDate').length).toBe(0)
    expect(textOf(doc, 'title')).toBe('Developer OS')
  })

  it('never leaks full article html — summary-only contract, proven with a realistic CompiledArticle[] fixture', () => {
    const marker = 'UNIQUE_HTML_ONLY_MARKER_7f3a'
    const compiled: CompiledArticle[] = [
      {
        slug: 'summary-only',
        title: 'A Normal Title',
        description: 'A normal description.',
        publishedAt: '2026-03-10',
        html: `<p>Full content containing ${marker}</p>`,
      },
    ]

    // `toRssXml` only reads the `RssItemSource` subset; TypeScript accepts
    // `CompiledArticle[]` structurally, no cast needed.
    const xml = toRssXml(compiled, baseUrl)

    expect(xml).not.toContain(marker)
  })
})
