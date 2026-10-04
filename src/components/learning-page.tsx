import { Link } from '@tanstack/react-router'
import { learningSections } from '../content/data/learning.ts'
import { localePrefix, type Locale } from '../lib/locale'

const COPY_EN = {
  title: 'Learning',
  lead: "Learning tracks what I'm actively studying and in which direction I'm developing as an engineer — the process, not the finished result. Blog is where a topic becomes a synthesis once it's worked through; Projects is where it gets applied; Changelog is what changed in Developer OS itself. Learning is what's still in progress.",
  relatedArticle: 'Related article →',
  relatedProject: 'Related project →',
  philosophyTitle: 'Learning philosophy',
  philosophy:
    "Learning here isn't a course list or a progress bar. There's no percentage complete, no certificate, no streak to keep. A topic stays on this page for as long as it's actively shaping decisions in Developer OS, and moves to \"recently explored\" once it's settled into working knowledge instead of an open question — or graduates into a Blog post once there's a synthesis worth writing down.",
  home: '← Home',
}

const COPY: Record<Locale, typeof COPY_EN> = {
  en: COPY_EN,
  'pt-br': {
    title: 'Aprendizado',
    lead: 'Aprendizado acompanha o que estou estudando ativamente e em que direção estou me desenvolvendo como engenheiro — o processo, não o resultado pronto. O Blog é onde um tema vira síntese depois de trabalhado; Projetos é onde ele é aplicado; o Changelog é o que mudou no próprio Developer OS. Aprendizado é o que ainda está em andamento.',
    relatedArticle: 'Artigo relacionado →',
    relatedProject: 'Projeto relacionado →',
    philosophyTitle: 'Filosofia de aprendizado',
    philosophy:
      'Aprendizado aqui não é uma lista de cursos nem uma barra de progresso. Não há porcentagem concluída, nem certificado, nem sequência para manter. Um tema fica nesta página enquanto estiver moldando ativamente decisões no Developer OS, e passa para "explorado recentemente" quando se assenta como conhecimento de trabalho em vez de questão em aberto — ou vira um post no Blog quando existe uma síntese que vale a pena escrever.',
    home: '← Início',
  },
}

export function learningTitle(locale: Locale): string {
  return COPY[locale].title
}

export function LearningPage({ locale }: Readonly<{ locale: Locale }>) {
  const copy = COPY[locale]
  const prefix = localePrefix(locale)

  return (
    <main className="relative isolate mx-auto flex min-h-screen max-w-2xl flex-col gap-12 px-6 py-16">
      <div aria-hidden="true" className="page-backdrop page-backdrop-listing" />
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">{copy.lead}</p>
      </div>
      {learningSections[locale].map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <ul className="space-y-4">
            {section.items.map((item) => (
              <li key={item.topic}>
                <p className="font-medium">{item.topic}</p>
                <p className="text-muted-foreground">{item.description}</p>
                {item.focus && <p className="text-muted-foreground">{item.focus}</p>}
                {item.articleSlug && (
                  <Link
                    to={`${prefix}/blog/$slug`}
                    params={{ slug: item.articleSlug }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {copy.relatedArticle}
                  </Link>
                )}
                {item.projectSlug && (
                  <Link
                    to={`${prefix}/projects/$slug`}
                    params={{ slug: item.projectSlug }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {copy.relatedProject}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{copy.philosophyTitle}</h2>
        <p className="text-muted-foreground">{copy.philosophy}</p>
      </section>
      <Link to={prefix || '/'} className="text-sm text-muted-foreground hover:text-foreground">
        {copy.home}
      </Link>
    </main>
  )
}
