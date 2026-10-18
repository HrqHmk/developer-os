# CLAUDE.md

## Project Context

Developer OS is a personal software engineering and AI orchestration platform.

Before making architectural decisions, consult:

- `docs/vision.md`
- `docs/architecture.md`
- `docs/design-system.md`
- relevant ADRs in `docs/adr/`

## Language & Communication

- Write code, comments, and commit messages in English.
- Write GitHub Issues and Pull Requests in English.
- Write documentation (`docs/`, `docs/adr/`, etc.) in Portuguese (matching existing docs).
- Respond in Portuguese during chat conversations unless requested otherwise.

## Working Principles

- Prefer simple and explicit solutions.
- Follow the architecture documented in `docs/architecture.md`.
- Do not introduce abstractions for hypothetical future requirements.
- Use explicit and semantic naming.
- Keep responsibilities small and well-defined.
- Follow existing project conventions before introducing new ones.

## Human-in-the-loop

Architectural decisions belong to the human engineer.

When a task requires an architectural decision that is not documented:

1. Do not silently decide.
2. Identify the decision that needs to be made.
3. Present alternatives and trade-offs.
4. Wait for human approval when appropriate.

## ADR Guidelines

When proposing or drafting an ADR in `docs/adr/`:
- Follow the naming pattern: `000X-short-title.md` (e.g., `0001-tech-stack.md`).
- Must include sections: **Contexto**, **Decisão**, **Status** (Proposto/Aceito/Substituído/Depreciado), e **Consequências** (prós e contras).
- Do not modify accepted ADRs to rewrite historical decisions. Create a new ADR when a previous decision is superseded.

## Engineering Workflow

Non-trivial changes (as defined in `docs/conventions.md` §11.5) follow the AI Engineering Workflow v2.0 (`docs/ai-engineering-workflow.md`).

- Precedence: accepted ADRs and `docs/conventions.md` prevail over the workflow when they conflict. Surface the conflict instead of resolving it silently.
- The Mission (GitHub Issue) defines success. Do not define, weaken, or reinterpret acceptance criteria.
- Do not implement before explicit human approval of the plan. Simple Issues keep the formal-plan exemption of `docs/conventions.md` §11.9, but still need a Mission, acceptance criteria, and human approval where applicable. Keep process proportional to risk.
- Report evidence as PASS / FAIL / NOT EXECUTED / NOT LOCALLY PROVABLE.
- The workflow is frozen and kept in English, as an exception to the Portuguese documentation rule.
- Eval Cases additionally follow `docs/evals/evaluation-protocol-v2.md`.

## Git

The workflow is defined by ADR-0004 (`docs/adr/0004-estrategia-de-git-e-branching.md`); operational conventions are in `docs/conventions.md` §11.

- Do not commit or push to `main`. Every change enters through a Pull Request.
- Non-trivial work starts from a GitHub Issue; treat it as the task contract.
- Propose, do not integrate: never merge, force-push a shared branch, delete branches or tags, or change branch protection.
- A review produced by an agent is input, never approval. Accepting findings and merging are human decisions.
- Do not perform destructive Git operations without explicit authorization.

## Testing

The strategy is defined by ADR-0005 (`docs/adr/0005-estrategia-de-testes.md`); operational conventions are in `docs/conventions.md` §12.

- Tests are mandatory for `src/content/pipeline/`, `src/content/schemas/`, integration mapping code, and non-obvious branching logic. They are explicitly not required for presentational components or content entries.
- Every bug fix ships with a test that fails before the fix.
- Changing an existing assertion changes a contract — justify it in the PR.
- Do not test dependencies or the framework, and do not duplicate in a test what the build already fails on.
- The runner is Vitest, not Jest. Testing dependencies are installed on demand, never ahead of the code that requires them.

## Documentation

Keep documentation synchronized with relevant architectural changes.

Do not modify accepted ADRs to rewrite historical decisions. Create a new ADR when a previous decision is superseded.