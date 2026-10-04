import { describe, expect, it } from 'vitest'
import {
  counterpartPath,
  englishPathOf,
  htmlLang,
  localeFromPathname,
  localizedPath,
} from './locale'
import { formatPublishedAt } from './format-published-at'

/** Every route shape of the site, in English (Issue #83 baseline inventory). */
const ENGLISH_PATHS = [
  '/',
  '/about',
  '/architecture',
  '/uses',
  '/learning',
  '/changelog',
  '/blog',
  '/blog/why-im-building-developer-os',
  '/projects',
  '/projects/developer-os',
  '/search',
]

describe('localeFromPathname', () => {
  it('reads /pt-br and everything under it as PT-BR', () => {
    expect(localeFromPathname('/pt-br')).toBe('pt-br')
    expect(localeFromPathname('/pt-br/')).toBe('pt-br')
    expect(localeFromPathname('/pt-br/blog/some-slug')).toBe('pt-br')
  })

  it('reads every other path as English, without matching on a bare prefix', () => {
    expect(localeFromPathname('/')).toBe('en')
    expect(localeFromPathname('/about')).toBe('en')
    expect(localeFromPathname('/pt-brx')).toBe('en')
    expect(localeFromPathname('/blog/pt-br')).toBe('en')
  })
})

describe('localizedPath', () => {
  it('leaves English paths untouched', () => {
    for (const path of ENGLISH_PATHS) expect(localizedPath('en', path)).toBe(path)
  })

  it('prefixes PT-BR paths, mapping the English home to /pt-br without a trailing slash', () => {
    expect(localizedPath('pt-br', '/')).toBe('/pt-br')
    expect(localizedPath('pt-br', '/about')).toBe('/pt-br/about')
    expect(localizedPath('pt-br', '/blog/a-slug')).toBe('/pt-br/blog/a-slug')
  })
})

describe('counterpartPath', () => {
  it('maps every English route shape to its PT-BR equivalent and back', () => {
    for (const path of ENGLISH_PATHS) {
      const ptBr = counterpartPath(path)
      expect(localeFromPathname(ptBr)).toBe('pt-br')
      expect(englishPathOf(ptBr)).toBe(path)
      expect(counterpartPath(ptBr)).toBe(path)
    }
  })

  it('keeps the same segments and slugs, changing only the prefix', () => {
    expect(counterpartPath('/projects/developer-os')).toBe('/pt-br/projects/developer-os')
    expect(counterpartPath('/pt-br/projects/developer-os')).toBe('/projects/developer-os')
    expect(counterpartPath('/pt-br')).toBe('/')
    expect(counterpartPath('/pt-br/')).toBe('/')
  })

  it('maps a path that does not exist to the same missing path, never to a home page', () => {
    expect(counterpartPath('/nonexistent')).toBe('/pt-br/nonexistent')
    expect(counterpartPath('/pt-br/blog/missing')).toBe('/blog/missing')
  })
})

describe('htmlLang', () => {
  it('uses BCP 47 tags', () => {
    expect(htmlLang('en')).toBe('en')
    expect(htmlLang('pt-br')).toBe('pt-BR')
  })
})

describe('formatPublishedAt', () => {
  it('keeps the English format as the default', () => {
    expect(formatPublishedAt('2026-09-27')).toBe('September 27, 2026')
  })

  it('formats PT-BR dates in Portuguese, on the same UTC calendar day', () => {
    expect(formatPublishedAt('2026-09-27', 'pt-br')).toBe('27 de setembro de 2026')
    expect(formatPublishedAt('2026-09-01', 'pt-br')).toBe('1 de setembro de 2026')
  })
})
