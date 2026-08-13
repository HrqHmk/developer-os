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

## Git

The workflow is defined by ADR-0004 (`docs/adr/0004-estrategia-de-git-e-branching.md`); operational conventions are in `docs/conventions.md` §11.

- Do not commit or push to `main`. Every change enters through a Pull Request.
- Non-trivial work starts from a GitHub Issue; treat it as the task contract.
- Propose, do not integrate: never merge, force-push a shared branch, delete branches or tags, or change branch protection.
- A review produced by an agent is input, never approval. Accepting findings and merging are human decisions.
- Do not perform destructive Git operations without explicit authorization.

## Documentation

Keep documentation synchronized with relevant architectural changes.

Do not modify accepted ADRs to rewrite historical decisions. Create a new ADR when a previous decision is superseded.