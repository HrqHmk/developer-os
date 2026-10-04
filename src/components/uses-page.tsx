import { Link } from '@tanstack/react-router'
import { usesSections } from '../content/data/uses.ts'
import { localePrefix, type Locale } from '../lib/locale'

const COPY_EN = {
  title: 'Uses',
  lead: 'The tools, software and setup actually used to build, learn and work on Developer OS — curated, not exhaustive.',
  closing: 'The human remains the final decision-maker.',
  home: '← Home',
}

const COPY: Record<Locale, typeof COPY_EN> = {
  en: COPY_EN,
  'pt-br': {
    title: 'Ferramentas',
    lead: 'As ferramentas, os softwares e o setup de fato usados para construir, aprender e trabalhar no Developer OS — uma seleção, não uma lista exaustiva.',
    closing: 'O humano continua sendo quem toma a decisão final.',
    home: '← Início',
  },
}

export function usesTitle(locale: Locale): string {
  return COPY[locale].title
}

export function UsesPage({ locale }: Readonly<{ locale: Locale }>) {
  const copy = COPY[locale]

  return (
    <main className="relative isolate mx-auto flex min-h-screen max-w-2xl flex-col gap-12 px-6 py-16">
      <div aria-hidden="true" className="page-backdrop page-backdrop-listing" />
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">{copy.lead}</p>
      </div>
      {usesSections[locale].map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <ul className="space-y-4">
            {section.items.map((item) => (
              <li key={item.name}>
                <p className="font-medium">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground"
                    >
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </p>
                <p className="text-muted-foreground">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-muted-foreground">{copy.closing}</p>
      <Link to={localePrefix(locale) || '/'} className="text-sm text-muted-foreground hover:text-foreground">
        {copy.home}
      </Link>
    </main>
  )
}
