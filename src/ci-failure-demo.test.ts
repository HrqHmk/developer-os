import { expect, it } from 'vitest'

// TEMPORARY — Issue #62, PR 1. Deliberately failing assertion that proves the
// `test` check goes red on a real failure. Reverted in the next commit.
it('demonstrates that a failing test turns the CI `test` check red', () => {
  expect(1).toBe(2)
})
