import { htmlLang, localizedPath, type Locale } from './locale.ts'

/**
 * Social and canonical metadata of the homepage (Issue #62), and the
 * language metadata every page carries (Issue #83).
 *
 * Pure data, on purpose: `src/routes/index.tsx` imports `virtual:*` modules
 * that Vitest cannot resolve, so metadata declared inline in the route could
 * not be tested. The home routes use `homeHeadFor(locale)` as their `head()`.
 *
 * Scope: the social/canonical tags are only used by the two home pages.
 * Nothing here is a site-wide default, and it must not be added to
 * `__root.tsx`.
 */

/**
 * Canonical origin of the published site. No trailing slash.
 *
 * Deliberately duplicated from `CANONICAL_BASE_URL` in
 * `src/content/pipeline/rss.ts`: that module is build-time code and is not
 * imported from application code. Keep both in sync.
 */
export const CANONICAL_ORIGIN = 'https://developeros.dev'

const OG_IMAGE_URL = `${CANONICAL_ORIGIN}/developer-os-og.png`
const OG_IMAGE_WIDTH = '1200'
const OG_IMAGE_HEIGHT = '630'

const SITE_NAME = 'Developer OS'

const HOME_COPY = {
  en: {
    description:
      'A public engineering lab for building software, orchestrating AI, and learning in public. Explore projects, technical writing, and engineering decisions.',
    socialTitle: 'Developer OS — Engineering in Public',
    socialDescription: 'Engineering software. Orchestrating AI. Learning in public.',
    socialImageAlt:
      'Developer OS — Engineering in Public. Engineering software. Orchestrating AI. Learning in public.',
    ogLocale: 'en_US',
  },
  'pt-br': {
    description:
      'Um laboratório público de engenharia para construir software, orquestrar IA e aprender em público. Conheça projetos, textos técnicos e decisões de engenharia.',
    socialTitle: 'Developer OS — Engenharia em Público',
    socialDescription: 'Engenharia de software. Orquestração de IA. Aprendizado em público.',
    // The OG image is a shared brand asset, in English for both languages
    // (Issue #83 human decision); its alt text describes what it shows.
    socialImageAlt:
      'Developer OS — Engineering in Public. Engineering software. Orchestrating AI. Learning in public.',
    ogLocale: 'pt_BR',
  },
} satisfies Record<Locale, Record<string, string>>

/** Absolute URL of a site path; the home page keeps the bare origin. */
function absoluteUrl(path: string): string {
  return path === '/' ? CANONICAL_ORIGIN : `${CANONICAL_ORIGIN}${path}`
}

/**
 * `hreflang` alternates for a page (Issue #83, AC6): the English and PT-BR
 * versions of the same page, with English as `x-default` since it is the
 * default language at the root URLs. `englishPath` is the page's English
 * path; the PT-BR one is derived by prefix, the same mapping the language
 * switch uses.
 */
export function languageAlternateLinks(englishPath: string) {
  const englishUrl = absoluteUrl(englishPath)
  return [
    { rel: 'alternate', hrefLang: htmlLang('en'), href: englishUrl },
    { rel: 'alternate', hrefLang: htmlLang('pt-br'), href: absoluteUrl(localizedPath('pt-br', englishPath)) },
    { rel: 'alternate', hrefLang: 'x-default', href: englishUrl },
  ]
}

/**
 * The `head()` of an ordinary page: its title, its description when it has
 * one, and its language alternates.
 */
export function pageHead(englishPath: string, title: string, description?: string) {
  return {
    meta: [{ title }, ...(description ? [{ name: 'description', content: description }] : [])],
    links: languageAlternateLinks(englishPath),
  }
}

/**
 * No `title` here: the homepage title comes from `__root.tsx` and must not be
 * declared a second time.
 */
export function homeHeadFor(locale: Locale) {
  const copy = HOME_COPY[locale]
  const url = absoluteUrl(localizedPath(locale, '/'))
  const alternateLocale = HOME_COPY[locale === 'en' ? 'pt-br' : 'en'].ogLocale

  return {
    meta: [
      { name: 'description', content: copy.description },
      { property: 'og:title', content: copy.socialTitle },
      { property: 'og:description', content: copy.socialDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { property: 'og:locale', content: copy.ogLocale },
      { property: 'og:locale:alternate', content: alternateLocale },
      { property: 'og:image', content: OG_IMAGE_URL },
      { property: 'og:image:width', content: OG_IMAGE_WIDTH },
      { property: 'og:image:height', content: OG_IMAGE_HEIGHT },
      { property: 'og:image:alt', content: copy.socialImageAlt },
      { property: 'og:site_name', content: SITE_NAME },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: copy.socialTitle },
      { name: 'twitter:description', content: copy.socialDescription },
      { name: 'twitter:image', content: OG_IMAGE_URL },
    ],
    links: [{ rel: 'canonical', href: url }, ...languageAlternateLinks('/')],
  }
}

/** The English homepage head, as `/` has always used it. */
export const homeHead = homeHeadFor('en')
