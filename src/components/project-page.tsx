import { Link } from '@tanstack/react-router'
import type { CompiledProject } from '../content/pipeline/build-projects.ts'
import { localePrefix, type Locale } from '../lib/locale'

const COPY: Record<Locale, { repository: string; back: string }> = {
  en: { repository: 'Repository →', back: '← Projects' },
  'pt-br': { repository: 'Repositório →', back: '← Projetos' },
}

export function ProjectPage({
  locale,
  project,
}: Readonly<{ locale: Locale; project: CompiledProject }>) {
  const copy = COPY[locale]

  return (
    <main className="relative isolate mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div aria-hidden="true" className="page-backdrop" />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold sm:text-4xl">{project.title}</h1>
        <p className="text-sm text-muted-foreground">{project.technologies.join(' · ')}</p>
        {project.repositoryUrl && (
          <a
            href={project.repositoryUrl}
            className="block text-sm text-muted-foreground hover:text-foreground"
          >
            {copy.repository}
          </a>
        )}
      </div>
      {/* Safe here: `html` is build-time output of the project's own content
          pipeline (versioned Markdown, validated in build), never user input. */}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: project.html }} />
      <Link to={`${localePrefix(locale)}/projects`} className="text-sm text-muted-foreground hover:text-foreground">
        {copy.back}
      </Link>
    </main>
  )
}
