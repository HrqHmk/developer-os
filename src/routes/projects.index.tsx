import { Link, createFileRoute } from '@tanstack/react-router'
import { projects } from 'virtual:projects'

export const Route = createFileRoute('/projects/')({
  head: () => ({
    meta: [{ title: 'Projects — Developer OS' }],
  }),
  component: Projects,
})

function Projects() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">Projects</h1>
      <ul className="space-y-8">
        {projects.map((project) => (
          <li key={project.slug} className="space-y-2">
            <Link to="/projects/$slug" params={{ slug: project.slug }} className="block space-y-2">
              <h2 className="text-xl font-semibold hover:text-foreground">{project.title}</h2>
              <p className="text-muted-foreground">{project.description}</p>
              <p className="text-sm text-muted-foreground">{project.technologies.join(' · ')}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Home
      </Link>
    </main>
  )
}
