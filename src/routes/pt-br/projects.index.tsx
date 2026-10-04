import { createFileRoute } from '@tanstack/react-router'
import { projects } from 'virtual:projects'
import { ProjectsIndexPage, projectsTitle } from '../../components/projects-index-page'
import { pageHead } from '../../lib/site-metadata.ts'

export const Route = createFileRoute('/pt-br/projects/')({
  head: () => pageHead('/projects', `${projectsTitle('pt-br')} — Developer OS`),
  component: () => <ProjectsIndexPage locale="pt-br" projects={projects['pt-br']} />,
})
