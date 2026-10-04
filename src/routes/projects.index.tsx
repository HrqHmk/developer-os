import { createFileRoute } from '@tanstack/react-router'
import { projects } from 'virtual:projects'
import { ProjectsIndexPage, projectsTitle } from '../components/projects-index-page'
import { pageHead } from '../lib/site-metadata.ts'

export const Route = createFileRoute('/projects/')({
  head: () => pageHead('/projects', `${projectsTitle('en')} — Developer OS`),
  component: () => <ProjectsIndexPage locale="en" projects={projects.en} />,
})
