import { Link, createFileRoute } from '@tanstack/react-router'
import { projects } from 'virtual:projects'
import { articles } from 'virtual:articles'
import { HomeHeader } from '../components/home-header'
import { learningSections } from '../content/data/learning.ts'
import { formatPublishedAt } from '../lib/format-published-at.ts'

export const Route = createFileRoute('/')({
  component: Home,
})

const FOCUS_RING = 'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

/** Verbatim from `/about`'s lead paragraph (`src/routes/about.tsx`) — not new copy. */
const ABOUT_SUMMARY =
  "Developer OS is a public engineering lab, not a portfolio. It's where I design, build, and document real software — including how I work with AI agents to do it."

function Home() {
  return (
    <>
      <HomeHeader />
      <main className="flex flex-col">
        <Hero />
        <FeaturedProjects />
        <WritingAndLearning />
        <About />
      </main>
    </>
  )
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-6 py-16 text-center">
      <div aria-hidden="true" className="hero-backdrop" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <p className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1 text-sm text-muted-foreground">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
          Now building: Developer OS
        </p>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Personal site for building in public
        </p>
        <h1 className="text-4xl font-bold leading-[1.1] sm:text-5xl">Developer OS</h1>
        <p className="text-lg text-muted-foreground">
          Engineering software. Orchestrating AI. Learning in public.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/projects"
            className={`rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover ${FOCUS_RING}`}
          >
            Explore Projects
          </Link>
          <Link
            to="/blog"
            className={`rounded-md border border-border bg-secondary px-5 py-3 text-sm font-medium text-secondary-foreground hover:text-foreground ${FOCUS_RING}`}
          >
            Read the Blog
          </Link>
        </div>
      </div>
    </section>
  )
}

const CARD_CLASSES = `block rounded-lg border border-border bg-card p-6 hover:border-foreground ${FOCUS_RING}`

function FeaturedProjects() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <h2 className="text-2xl font-semibold">Featured Projects</h2>
      <ul className="flex flex-col gap-4">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link to="/projects/$slug" params={{ slug: project.slug }} className={CARD_CLASSES}>
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

function WritingAndLearning() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <h2 className="text-2xl font-semibold">Writing & Learning</h2>
      <ul className="flex flex-col gap-4">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link to="/blog/$slug" params={{ slug: article.slug }} className={CARD_CLASSES}>
              <h3 className="text-lg font-semibold">{article.title}</h3>
              <p className="mt-2 text-muted-foreground">{article.description}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {formatPublishedAt(article.publishedAt)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-6">
        {learningSections.map((section) => (
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

function About() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
      <h2 className="text-2xl font-semibold">About</h2>
      <p className="text-muted-foreground">{ABOUT_SUMMARY}</p>
      <Link to="/about" className={`text-sm text-muted-foreground hover:text-foreground ${FOCUS_RING}`}>
        More about Developer OS →
      </Link>
    </section>
  )
}
