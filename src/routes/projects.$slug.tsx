import { createFileRoute, notFound } from '@tanstack/react-router'
import { projects } from 'virtual:projects'
import { ProjectPage } from '../components/project-page'
import { pageHead } from '../lib/site-metadata.ts'

export const Route = createFileRoute('/projects/$slug')({
  loader: ({ params }) => {
    const project = projects.en.find((p) => p.slug === params.slug)
    if (!project) throw notFound()
    return project
  },
  head: ({ loaderData, params }) =>
    loaderData
      ? pageHead(
          `/projects/${params.slug}`,
          `${loaderData.title} — Developer OS`,
          loaderData.description,
        )
      : {},
  component: function ProjectDetail() {
    return <ProjectPage locale="en" project={Route.useLoaderData()} />
  },
})
