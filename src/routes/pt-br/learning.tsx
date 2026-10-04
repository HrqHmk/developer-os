import { createFileRoute } from '@tanstack/react-router'
import { LearningPage, learningTitle } from '../../components/learning-page'
import { pageHead } from '../../lib/site-metadata.ts'

export const Route = createFileRoute('/pt-br/learning')({
  head: () => pageHead('/learning', `${learningTitle('pt-br')} — Developer OS`),
  component: () => <LearningPage locale="pt-br" />,
})
