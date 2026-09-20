/**
 * Social and canonical metadata of the homepage (Issue #62).
 *
 * Pure data, on purpose: `src/routes/index.tsx` imports `virtual:*` modules
 * that Vitest cannot resolve, so metadata declared inline in the route could
 * not be tested. The route spreads `homeHead` into its `head()`.
 *
 * Scope: only `/` uses this. Nothing here is a site-wide default, and it must
 * not be added to `__root.tsx`.
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
const DESCRIPTION =
  'A public engineering lab for building software, orchestrating AI, and learning in public. Explore projects, technical writing, and engineering decisions.'
const SOCIAL_TITLE = 'Developer OS — Engineering in Public'
const SOCIAL_DESCRIPTION = 'Engineering software. Orchestrating AI. Learning in public.'
const SOCIAL_IMAGE_ALT =
  'Developer OS — Engineering in Public. Engineering software. Orchestrating AI. Learning in public.'

/**
 * No `title` here: the homepage title comes from `__root.tsx` and must not be
 * declared a second time.
 */
export const homeHead = {
  meta: [
    { name: 'description', content: DESCRIPTION },
    { property: 'og:title', content: SOCIAL_TITLE },
    { property: 'og:description', content: SOCIAL_DESCRIPTION },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: CANONICAL_ORIGIN },
    { property: 'og:image', content: OG_IMAGE_URL },
    { property: 'og:image:width', content: OG_IMAGE_WIDTH },
    { property: 'og:image:height', content: OG_IMAGE_HEIGHT },
    { property: 'og:image:alt', content: SOCIAL_IMAGE_ALT },
    { property: 'og:site_name', content: SITE_NAME },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: SOCIAL_TITLE },
    { name: 'twitter:description', content: SOCIAL_DESCRIPTION },
    { name: 'twitter:image', content: OG_IMAGE_URL },
  ],
  links: [{ rel: 'canonical', href: CANONICAL_ORIGIN }],
}
