/**
 * A tag emitted by `toHtml()`, matched quote-aware. A tag ends at the first
 * `>` that is *outside* a quoted attribute value — which is exact, not a
 * heuristic, for this pipeline: `rehype-stringify` always double-quotes
 * attribute values and escapes any `"` inside them (`&#x22;`), while it
 * leaves a literal `>` in a value alone (e.g. `alt="a > b"`). A plain
 * `/<[^>]*>/` would end that tag early and leak `b">` into the text.
 */
const TAG = /<[^>"]*(?:"[^"]*"[^>"]*)*>/g

/** The one attribute carrying authored text. Leading whitespace is required
 *  so no other attribute name can end in `alt`. */
const IMAGE_ALT = /\salt="([^"]*)"/

const IMAGE_TAG = /^<img[\s>]/i

const NAMED_REFERENCES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
}

const CHARACTER_REFERENCE = /&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|(amp|lt|gt|quot|apos));/g

/**
 * Resolves character references in **one pass**. Sequential `replaceAll`
 * calls would decode their own output — `&#x26;lt;` (an escaped, literal
 * `&lt;`) would wrongly become `<`. A single pass cannot: the scanner never
 * revisits what it just wrote.
 */
function decodeCharacterReferences(value: string): string {
  return value.replace(CHARACTER_REFERENCE, (_match, decimal, hex, named) => {
    if (decimal !== undefined) return String.fromCodePoint(Number(decimal))
    if (hex !== undefined) return String.fromCodePoint(parseInt(hex, 16))
    return NAMED_REFERENCES[named]
  })
}

/**
 * Derives the searchable plain text of a compiled content body (Issue #48).
 * Build-time only — it never runs in the browser.
 *
 * It reads HTML this project's own pipeline produced, not arbitrary HTML:
 * ADR-0003 P9 fails the build on raw HTML in content, so the tag set here is
 * closed and known. That is what makes a short scan sufficient and an HTML
 * parser unnecessary.
 *
 * Images are the one construct whose text lives in an attribute. `<img>` is
 * void, so dropping tags outright would discard authored content; the `alt`
 * value is substituted in place of the tag instead. Nothing else about an
 * image is read — not `src`, not `title`.
 *
 * Substitution adds no whitespace of its own, and tags contribute the empty
 * string, because `rehype-stringify` already separates block-level elements
 * with a newline. Inserting a space per tag would instead split words that
 * inline markup joined (`Developer**OS**`).
 */
export function htmlToPlainText(html: string): string {
  const text = html.replace(TAG, (tag) => {
    if (!IMAGE_TAG.test(tag)) return ''
    // The *raw* alt: decoding happens once, below, over the whole string.
    // Decoding it here and again there would double-decode an alt that
    // legitimately contains a reference.
    return IMAGE_ALT.exec(tag)?.[1] ?? ''
  })

  return decodeCharacterReferences(text).replace(/\s+/g, ' ').trim()
}
