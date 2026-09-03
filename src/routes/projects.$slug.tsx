import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { projects } from 'virtual:projects'

export const Route = createFileRoute('/projects/$slug')({
  loader: ({ params }) => {
    const project = projects.find((p) => p.slug === params.slug)
    if (!project) throw notFound()
    return project
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.title} — Developer OS` }] : [],
  }),
  component: ProjectDetail,
})

function ProjectDetail() {
  const project = Route.useLoaderData()

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold sm:text-4xl">{project.title}</h1>
        <p className="text-sm text-muted-foreground">{project.technologies.join(' · ')}</p>
        {project.repositoryUrl && (
          <a
            href={project.repositoryUrl}
            className="block text-sm text-muted-foreground hover:text-foreground"
          >
            Repository →
          </a>
        )}
      </div>
      {/* Safe here: `html` is build-time output of the project's own content
          pipeline (versioned Markdown, validated in build), never user input. */}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: project.html }} />
      <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground">
        ← Projects
      </Link>
    </main>
  )
}
