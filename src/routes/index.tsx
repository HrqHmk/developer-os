import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-bold leading-[1.1] sm:text-5xl">Developer OS</h1>
      <p className="text-lg text-muted-foreground">
        Engineering software. Orchestrating AI. Learning in public.
      </p>
      <div className="flex gap-4">
        <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
          About →
        </Link>
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          Blog →
        </Link>
      </div>
    </main>
  )
}
