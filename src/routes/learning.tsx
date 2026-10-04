import { createFileRoute } from '@tanstack/react-router'
import { LearningPage, learningTitle } from '../components/learning-page'
import { pageHead } from '../lib/site-metadata.ts'

export const Route = createFileRoute('/learning')({
  head: () => pageHead('/learning', `${learningTitle('en')} — Developer OS`),
  component: () => <LearningPage locale="en" />,
})
