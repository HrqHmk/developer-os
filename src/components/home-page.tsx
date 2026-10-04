import { Link } from '@tanstack/react-router'
import type { CompiledArticle } from '../content/pipeline/build-articles.ts'
import type { CompiledProject } from '../content/pipeline/build-projects.ts'
import { learningSections } from '../content/data/learning.ts'
import { formatPublishedAt } from '../lib/format-published-at.ts'
import { localePrefix, type Locale } from '../lib/locale'
import { HeroPuzzlePieces } from './hero-puzzle-pieces'
import { HomeHeader } from './home-header'
import { aboutSummary } from './about-page'

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

const COPY_EN = {
  nowBuilding: 'Now building: Developer OS',
  eyebrow: 'Personal site for building in public',
  tagline: 'Engineering software. Orchestrating AI. Learning in public.',
  exploreProjects: 'Explore Projects',
  readBlog: 'Read the Blog',
  featuredProjects: 'Featured Projects',
  writingAndLearning: 'Writing & Learning',
  about: 'About',
  moreAbout: 'More about Developer OS →',
}

const COPY: Record<Locale, typeof COPY_EN> = {
  en: COPY_EN,
  'pt-br': {
    nowBuilding: 'Construindo agora: Developer OS',
    eyebrow: 'Site pessoal para construir em público',
    tagline: 'Engenharia de software. Orquestração de IA. Aprendizado em público.',
    exploreProjects: 'Explorar Projetos',
    readBlog: 'Ler o Blog',
    featuredProjects: 'Projetos em destaque',
    writingAndLearning: 'Escrita e Aprendizado',
    about: 'Sobre',
    moreAbout: 'Mais sobre o Developer OS →',
  },
}

type HomeProps = Readonly<{
  locale: Locale
  projects: CompiledProject[]
  articles: CompiledArticle[]
}>

export function HomePage({ locale, projects, articles }: HomeProps) {
  return (
    <>
      <HomeHeader locale={locale} />
      <main className="flex flex-col">
        <Hero locale={locale} />
        <FeaturedProjects locale={locale} projects={projects} />
        <WritingAndLearning locale={locale} articles={articles} />
        <About locale={locale} />
      </main>
    </>
  )
}

function Hero({ locale }: Readonly<{ locale: Locale }>) {
  const copy = COPY[locale]
  const prefix = localePrefix(locale)

  return (
    <section className="relative isolate overflow-hidden px-6 py-16 text-center">
      <div aria-hidden="true" className="hero-backdrop" />
      <HeroPuzzlePieces />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <p className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1 text-sm text-muted-foreground">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
          {copy.nowBuilding}
        </p>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">{copy.eyebrow}</p>
        <h1 className="text-4xl font-bold leading-[1.1] sm:text-5xl">Developer OS</h1>
        <p className="text-lg text-muted-foreground">{copy.tagline}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to={`${prefix}/projects`}
            className={`rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover ${FOCUS_RING}`}
          >
            {copy.exploreProjects}
          </Link>
          <Link
            to={`${prefix}/blog`}
            className={`rounded-md border border-border bg-secondary px-5 py-3 text-sm font-medium text-secondary-foreground hover:text-foreground ${FOCUS_RING}`}
          >
            {copy.readBlog}
          </Link>
        </div>
      </div>
    </section>
  )
}

const CARD_CLASSES = `block rounded-lg border border-border bg-card p-6 hover:border-foreground ${FOCUS_RING}`

function FeaturedProjects({
  locale,
  projects,
}: Readonly<{ locale: Locale; projects: CompiledProject[] }>) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <h2 className="text-2xl font-semibold">{COPY[locale].featuredProjects}</h2>
      <ul className="flex flex-col gap-4">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link
              to={`${localePrefix(locale)}/projects/$slug`}
              params={{ slug: project.slug }}
              className={CARD_CLASSES}
            >
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <p className="mt-2 text-muted-foreground">{project.description}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {project.technologies.join(' · ')}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function WritingAndLearning({
  locale,
  articles,
}: Readonly<{ locale: Locale; articles: CompiledArticle[] }>) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <h2 className="text-2xl font-semibold">{COPY[locale].writingAndLearning}</h2>
      <ul className="flex flex-col gap-4">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              to={`${localePrefix(locale)}/blog/$slug`}
              params={{ slug: article.slug }}
              className={CARD_CLASSES}
            >
              <h3 className="text-lg font-semibold">{article.title}</h3>
              <p className="mt-2 text-muted-foreground">{article.description}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {formatPublishedAt(article.publishedAt, locale)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-6">
        {learningSections[locale].map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-muted-foreground">{section.title}</h3>
            <ul className="mt-3 flex flex-col gap-3">
              {section.items.map((item) => (
                <li key={item.topic}>
                  <p className="font-medium">{item.topic}</p>
                  <p className="text-muted-foreground">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function About({ locale }: Readonly<{ locale: Locale }>) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
      <h2 className="text-2xl font-semibold">{COPY[locale].about}</h2>
      {/* Verbatim from the About page's lead paragraph — not new copy. */}
      <p className="text-muted-foreground">{aboutSummary(locale)}</p>
      <Link
        to={`${localePrefix(locale)}/about`}
        className={`text-sm text-muted-foreground hover:text-foreground ${FOCUS_RING}`}
      >
        {COPY[locale].moreAbout}
      </Link>
    </section>
  )
}
