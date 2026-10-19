import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPage, privacyDescription, privacyTitle } from '../../components/privacy-page'
import { pageHead } from '../../lib/site-metadata.ts'

export const Route = createFileRoute('/pt-br/privacy')({
  head: () => pageHead('/privacy', privacyTitle('pt-br'), privacyDescription('pt-br')),
  component: () => <PrivacyPage locale="pt-br" />,
})
