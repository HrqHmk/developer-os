import { Link } from '@tanstack/react-router'
import type { CompiledProject } from '../content/pipeline/build-projects.ts'
import { localePrefix, type Locale } from '../lib/locale'

const COPY: Record<Locale, { title: string; home: string }> = {
  en: { title: 'Projects', home: '← Home' },
  'pt-br': { title: 'Projetos', home: '← Início' },
}

export function projectsTitle(locale: Locale): string {
  return COPY[locale].title
}

export function ProjectsIndexPage({
  locale,
  projects,
}: Readonly<{ locale: Locale; projects: CompiledProject[] }>) {
  const copy = COPY[locale]
  const prefix = localePrefix(locale)

  return (
    <main className="relative isolate mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div aria-hidden="true" className="page-backdrop page-backdrop-listing" />
      <h1 className="text-3xl font-bold sm:text-4xl">{copy.title}</h1>
      <ul className="space-y-8">
        {projects.map((project) => (
          <li key={project.slug} className="space-y-2">
            <Link to={`${prefix}/projects/$slug`} params={{ slug: project.slug }} className="block space-y-2">
              <h2 className="text-xl font-semibold hover:text-foreground">{project.title}</h2>
              <p className="text-muted-foreground">{project.description}</p>
              <p className="text-sm text-muted-foreground">{project.technologies.join(' · ')}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Link to={prefix || '/'} className="text-sm text-muted-foreground hover:text-foreground">
        {copy.home}
      </Link>
    </main>
  )
}
