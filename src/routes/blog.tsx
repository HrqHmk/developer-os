import { Outlet, createFileRoute } from '@tanstack/react-router'

// Layout route: `/blog` and `/blog/$slug` share this file prefix in
// TanStack Router's flat-file convention, which nests `$slug` under it.
// This file exists only to provide the `<Outlet />` that nesting requires —
// no shared chrome (no navbar/header/footer) is introduced here.
export const Route = createFileRoute('/blog')({
  component: () => <Outlet />,
})
