import { Outlet, createFileRoute } from '@tanstack/react-router'

// Layout route: `/pt-br/projects` and `/pt-br/projects/$slug` share this file prefix in
// TanStack Router's flat-file convention, which nests `$slug` under it.
// This file exists only to provide the `<Outlet />` that nesting requires —
// no shared chrome (no navbar/header/footer) is introduced here.
export const Route = createFileRoute('/pt-br/projects')({
  component: () => <Outlet />,
})
