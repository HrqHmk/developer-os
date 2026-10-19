import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPage, privacyDescription, privacyTitle } from '../components/privacy-page'
import { pageHead } from '../lib/site-metadata.ts'

export const Route = createFileRoute('/privacy')({
  head: () => pageHead('/privacy', privacyTitle('en'), privacyDescription('en')),
  component: () => <PrivacyPage locale="en" />,
})
