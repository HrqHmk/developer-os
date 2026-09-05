import { Link, createFileRoute } from '@tanstack/react-router'
import { usesSections } from '../content/data/uses.ts'

export const Route = createFileRoute('/uses')({
  head: () => ({
    meta: [{ title: 'Uses — Developer OS' }],
  }),
  component: Uses,
})

function Uses() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-12 px-6 py-16">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">Uses</h1>
        <p className="text-lg text-muted-foreground">
          The tools, software and setup actually used to build, learn and work on Developer OS —
          curated, not exhaustive.
        </p>
      </div>
      {usesSections.map((section) => (
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
      <p className="text-muted-foreground">The human remains the final decision-maker.</p>
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Home
      </Link>
    </main>
  )
}
