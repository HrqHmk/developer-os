import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // `.test.tsx` is listed explicitly: component tests (Issue #48) live in
    // `.tsx` files, and a pattern that only matched `.test.ts` would skip
    // them silently — the suite would stay green without running them.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
