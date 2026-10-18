# Developer OS — AI Engineering Workflow v2.0

**Status:** FROZEN  
**Context:** Developer OS  
**Date:** October 2026  
**Purpose:** define the human-in-the-loop engineering workflow used for non-trivial Developer OS changes, from mission framing through implementation, independent evaluation, and merge.

---

## 1. Why this workflow exists

Developer OS is not built as a sequence of prompts handed to one model.

The workflow separates:

- product and requirement framing;
- mission definition;
- repository and contract analysis;
- implementation planning;
- implementation;
- validation and evidence collection;
- independent evaluation;
- human acceptance and merge.

The objective is not to maximize process. It is to reduce the probability that an AI agent ships work that is locally plausible but violates product intent, architectural contracts, system invariants, or real runtime behavior.

The core rule is:

> **The implementation agent does not define its own success criteria.**

Success is defined before implementation through a human-approved Mission and is evaluated against that Mission, the repository's existing contracts, and concrete evidence.

---

## 2. Principles

### P01 — Human-in-the-loop

AI agents can inspect, propose, criticize, implement, validate, and review.

Humans remain responsible for:

- product intent;
- scope decisions;
- architectural trade-offs when they matter;
- acceptance of findings;
- final merge.

### P02 — Mission before plan

A non-trivial change starts with a Mission that defines **what must become true**, not how the agent should implement it.

The implementation plan is downstream of the Mission and cannot weaken, reinterpret, or silently replace it.

### P03 — The executor does not define the test it must pass

Claude may propose validation mechanisms, but acceptance criteria and expected evidence are not invented retroactively by the same agent after implementation.

This prevents the circular pattern:

```text
agent defines success
        ↓
agent implements
        ↓
agent proves success using only the conditions it selected
```

### P04 — Existing contracts must propagate into the change

A property documented in architecture, ADRs, conventions, schemas, deployment rules, or established behavior does not become irrelevant because the Issue omitted it.

The planning phase must actively recover the existing contracts materially touched by the change.

### P05 — New invariants must be discovered when the task exposes them

Not every important property already exists in documentation.

When a change introduces or touches state, persistence, I/O, concurrency, identity, ordering, integrations, or partial failure, the plan must identify the small set of properties that must remain true.

The purpose is not to enumerate every possible edge case. It is to model the system properties whose violation would make the result incorrect, inconsistent, or misleading.

### P06 — Evidence beats assumption

Green CI, framework intuition, implementation-agent confidence, and build logs are not proof of behavior that can be checked directly.

Use the strongest practical evidence for the property being claimed:

- automated tests;
- typecheck/static checks;
- build failures;
- artifact inspection;
- runtime validation;
- negative/failure-path tests;
- provider/production validation when the contract is external.

### P07 — Independent review is risk-based

Codex is not a mandatory second opinion on every diff.

Independent review is introduced when an external reasoning path has meaningful value: architecture, runtime boundaries, state integrity, persistence, concurrency, data contracts, integrations, deploy behavior, complex fixes, or evidence gaps.

### P08 — Review must attack properties, not search randomly for bugs

A good review asks:

> **What must remain true, and is there a legitimate path by which it becomes false despite the current checks?**

### P09 — Fixes can create second-order failure modes

A finding is not closed merely because the first observed defect disappeared.

When a correction changes persistence, transitions, failure semantics, concurrency, or an architectural boundary, the changed delta receives targeted review before acceptance.

### P10 — Findings should improve the system permanently

A meaningful accepted finding should, when practical, become one or more of:

- a test;
- a build/static check;
- a runtime guard;
- an architectural rule;
- a convention;
- a future review heuristic.

---

## 3. Roles

| Role | Primary responsibility | Must not own |
|---|---|---|
| **Human — Henrique** | Product intent, final technical/product decisions, approval of Mission, plan, findings, PR, and merge. | Delegating accountability to an agent. |
| **Friday / ChatGPT** | Mission framing, requirement analysis, architecture discussion, orchestration, contract/invariant reasoning, synthesis of evidence and reviews. | Becoming the main implementation bottleneck or silently redefining product intent. |
| **Claude Code** | Repository inspection, baseline reconstruction, contract/invariant analysis, Implementation Plan, main implementation, tests, validation, evidence, PR creation. | Defining the Mission after the fact, weakening acceptance criteria, merging its own work, or silently changing approved architecture. |
| **Codex** | Independent planning review and/or implementation evaluation when risk justifies an independent reasoning path. | Reframing the product, expanding scope speculatively, or reviewing every change by default. |

---

## 4. Canonical lifecycle

```text
PROBLEM / ROADMAP ITEM
        ↓
SCOPE DISCUSSION
        ↓
MISSION / ISSUE
        ↓
MISSION REVIEW + HUMAN APPROVAL
        ↓
REPOSITORY BASELINE + CONTRACT / INVARIANT ANALYSIS
        ↓
IMPLEMENTATION PLAN
        ↓
RISK-BASED PLAN REVIEW
        ↓
HUMAN APPROVAL
        ↓
IMPLEMENTATION
        ↓
SELF-VALIDATION + EVIDENCE
        ↓
PULL REQUEST
        ↓
RISK-BASED INDEPENDENT EVALUATION
        ↓
FIX DELTA REVIEW, WHEN NEEDED
        ↓
HUMAN FINAL REVIEW
        ↓
SQUASH / MERGE
        ↓
LEARNING CAPTURE
```

Not every change requires Codex at both review points.

The Mission, however, remains independent from the implementation agent for every non-trivial change.

---

## 5. Mission

The Mission is the source of truth for what the change must accomplish.

In Developer OS, the GitHub Issue is the preferred Mission artifact unless a separate document is clearly justified.

### 5.1 Mission template

```markdown
# <Mission title>

## Context
Why does this change exist?

## Problem
What is currently missing, incorrect, risky, or limiting?

## Desired outcome
What must be true when the work is complete?

## Scope
What is explicitly included?

## Non-goals / Out of scope
What must not be introduced by this work?

## Baseline
What current behavior, content, architecture, accessibility, performance,
or operational state must be verified rather than assumed?

## Known existing contracts affected
List contracts already known during Mission framing.
Do not treat this as exhaustive; planning must independently recover others.

## Acceptance criteria
Observable conditions required for acceptance.

## Expected evidence
What evidence should demonstrate the acceptance criteria?
Include representative non-happy-path evidence when the risk requires it.

## Open questions / ambiguities
What must be surfaced for human decision rather than silently resolved?
```

### 5.2 Mission rules

The Mission:

- defines outcome, not implementation;
- must not prescribe architecture unless architecture is itself a frozen constraint;
- must distinguish explicit non-goals from unspecified implementation freedom;
- should identify baseline behavior when regression matters;
- should require evidence proportional to risk;
- must not rely only on happy-path success when known failure semantics matter.

The Implementation Plan may discover that the Mission is incomplete or contradictory.

If so:

> **Stop and surface the conflict. Do not silently repair the Mission inside the plan.**

---

## 6. Baseline reconstruction

Before proposing implementation for a non-trivial change, Claude inspects the repository and records the baseline relevant to the Mission.

The baseline is not a general repository report.

It should answer only what the change depends on, for example:

- current routes and public surfaces;
- existing data/state model;
- current persistence semantics;
- existing architecture boundaries;
- relevant tests and CI checks;
- current deploy/runtime behavior;
- existing accessibility or responsive behavior;
- existing external integrations;
- known contracts in ADRs/conventions/schemas.

Rule:

> **Do not design from documentation alone when the repository can verify the current implementation.**

---

## 7. Contract analysis

The planner must explicitly identify existing contracts materially touched by the task.

### 7.1 Sources of contracts

Contracts may come from:

- Mission / Issue;
- accepted ADRs;
- `docs/conventions.md`;
- schemas and types;
- public URL behavior;
- existing tests;
- deployment rules;
- operational records;
- established user-visible behavior;
- compatibility guarantees.

### 7.2 Required plan section

```markdown
## Existing contracts affected

| Contract | Source | Property that must remain true | How this plan preserves it |
|---|---|---|---|
| ... | ... | ... | ... |
```

If none are materially affected:

```text
N/A — <short reason>
```

### 7.3 Contract propagation rule

For every relevant existing contract:

```text
SOURCE CONTRACT
      ↓
TASK / MISSION RELEVANCE
      ↓
IMPLEMENTATION MECHANISM
      ↓
VALIDATION MECHANISM
      ↓
EVIDENCE
```

A contract is not considered protected merely because it appears in an ADR.

---

## 8. Invariant discovery

Contract analysis recovers what the project already knows.

Invariant discovery asks what the current change exposes that may not yet be explicitly documented.

### 8.1 Risk lenses

When relevant, inspect the change through these lenses:

- **state integrity** — what relationships must always remain valid?
- **persistence / I/O** — what happens if read or write fails?
- **concurrency / stale state** — can two actors overwrite or diverge silently?
- **identity / uniqueness** — what must remain unique or referentially valid?
- **ordering / determinism** — what must remain stable under ties or repeated runs?
- **dates / boundaries** — what legitimate boundary values can change behavior?
- **partial failure** — can half of an operation succeed and still be reported as full success?
- **external integration** — what is locally provable and what requires operational evidence?
- **runtime/build boundary** — can build-only logic leak into runtime?

These are lenses, not a mandatory checklist.

Do not manufacture irrelevant edge cases simply to populate the section.

### 8.2 Required plan section

```markdown
## System invariants introduced or exposed

| Invariant | Why it matters | Relevant failure mode | Protection | Evidence |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |
```

If no new invariant is materially relevant:

```text
N/A — <short reason>
```

---

## 9. Implementation Plan

Claude produces the Implementation Plan only after inspecting the Mission and repository baseline.

The plan is the contract for **how** the Mission will be executed.

### 9.1 Minimum structure

```markdown
# <Mission> — Implementation Plan

Status: AWAITING REVIEW

## A. Mission summary
Restate the approved outcome without changing it.

## B. Baseline
Relevant current repository/runtime facts.

## C. Existing contracts affected
Contract mapping from §7.

## D. System invariants introduced or exposed
Invariant mapping from §8.

## E. Proposed implementation
Architecture, modules, data flow, runtime/build boundaries.

## F. Files and surfaces affected
Expected change surface.

## G. Dependencies
New dependencies and justification, if any.

## H. Validation strategy
Automated, artifact, runtime, manual, and operational checks.

## I. Acceptance / evidence matrix
Map Mission criteria and critical contracts/invariants to evidence.

## J. Risks / findings / open decisions
BLOCKER / SHOULD FIX / NON-BLOCKING / ACCEPTABLE AS-IS.

## K. Scope confirmation
Explicit confirmation that the plan does not expand the Mission.

## Approval Gate
Status: AWAITING REVIEW
```

### 9.2 Evidence matrix

For non-trivial work, use a compact matrix:

| Requirement / contract / invariant | Protection mechanism | Evidence to collect |
|---|---|---|
| AC-1 | ... | ... |
| ADR-X | ... | ... |
| INV-1 | ... | ... |

This matrix is the bridge between specification and evaluation.

---

## 10. Planning review

Planning review asks whether the proposed design can satisfy the Mission without violating repository contracts.

### 10.1 Codex is especially justified when the plan touches

- framework/runtime/build boundaries;
- persistence or state integrity;
- concurrency;
- authentication/authorization;
- schemas or compatibility contracts;
- external integrations;
- deployment infrastructure;
- new architectural mechanisms;
- high-cost or difficult-to-reverse decisions;
- a broad or unusually complex change surface.

### 10.2 Planning review questions

The reviewer should ask:

- Does the plan actually satisfy the Mission?
- Did the planner omit an existing contract materially touched by the change?
- Are system invariants missing?
- Does the design violate an architectural/runtime boundary by construction?
- Is the evidence plan capable of proving the claimed behavior?
- Is any scope expansion disguised as implementation detail?

The reviewer should prefer the smallest correction that restores the contract.

---

## 11. Human approval gate

Implementation starts only after explicit approval of the plan.

Approval means:

- the Mission is still intact;
- major architectural choices are acceptable;
- relevant contracts/invariants are represented;
- validation is proportionate to risk;
- unresolved BLOCKER findings are zero.

Example:

> **Implementation Plan: APPROVED**

---

## 12. Implementation rules

Claude implements the approved plan.

During implementation:

- do not silently change the Mission;
- do not silently change frozen architecture;
- do not expand scope because a larger design appears cleaner;
- do not weaken a contract because it complicates implementation;
- add regression coverage for confirmed bugs when practical;
- preserve evidence needed for review.

If implementation reveals that the plan is wrong or the repository contradicts the baseline:

> **Stop, record the conflict, and request a decision before redesigning.**

Micro-adjustments inside the approved design do not require a new plan.

Architectural changes do.

---

## 13. Self-validation and evidence

The implementation agent must validate its own work, but self-validation is evidence production, not final acceptance.

### 13.1 Standard checks

Use the checks relevant to the project, typically:

- typecheck;
- tests;
- build;
- lint/static analysis when applicable;
- route/runtime checks;
- console/browser validation;
- artifact inspection.

### 13.2 Targeted evidence

For critical contracts/invariants, use targeted evidence rather than relying only on broad green commands.

Examples:

- inspect generated HTML for prerender behavior;
- scan runtime bundles for build-only dependencies;
- deliberately supply invalid schema input and confirm failure;
- simulate storage read/write failure;
- test stale-state/concurrent paths;
- inspect emitted assets;
- verify production/provider behavior when local tools cannot prove it.

### 13.3 Evidence honesty

Never claim a check passed if it was not executed.

Use explicit states such as:

- `PASS`
- `FAIL`
- `NOT EXECUTED`
- `NOT LOCALLY PROVABLE`

---

## 14. Pull request

The PR should expose enough information for an independent reviewer to evaluate the change without reconstructing the entire implementation conversation.

At minimum:

- Mission / Issue reference;
- implementation summary;
- important architectural decisions;
- contracts/invariants materially affected;
- validation/evidence performed;
- known limitations or non-blocking findings;
- explicit deviations from the approved plan, if any.

The implementation agent may create the PR.

It does not merge it.

---

## 15. Independent evaluation

Independent evaluation is not a second implementation pass.

The evaluator receives the Mission, relevant repository contracts, the implementation/diff, and evidence.

The evaluator should not use the Implementation Plan as the definition of success when the Plan conflicts with the Mission.

Priority order:

```text
MISSION / ACCEPTANCE CRITERIA
        ↓
EXISTING REPOSITORY CONTRACTS
        ↓
SYSTEM INVARIANTS
        ↓
APPROVED IMPLEMENTATION PLAN
        ↓
IMPLEMENTATION EVIDENCE
```

### 15.1 Evaluation questions

- Does the implementation satisfy every relevant acceptance criterion?
- Are existing contracts still true?
- Are declared invariants actually protected?
- Is there a legitimate non-happy-path state that violates them despite green checks?
- Does the evidence prove what the PR claims?
- Did implementation expand scope or silently change architecture?
- Are there untested failure semantics that could convert unknown/partial state into success?

### 15.2 Findings

Each meaningful finding should include:

- severity;
- requirement / contract / invariant affected;
- expected behavior;
- observed behavior;
- evidence;
- smallest recommended correction.

Suggested severity language:

- **BLOCKER** — cannot accept/merge as-is;
- **SHOULD FIX** — real issue that should normally be corrected before merge;
- **NON-BLOCKING** — real but acceptable for current scope;
- **ACCEPTABLE AS-IS** — reviewed concern that does not require change.

### 15.3 Evaluation verdict

Use a concise final verdict such as:

- **READY TO MERGE**
- **READY AFTER FIXES**
- **NOT READY**

---

## 16. Fix delta review

A correction can introduce new failure modes.

After a meaningful fix, do not automatically replay the entire review.

Review the delta when the correction changes:

- persistence semantics;
- state transitions;
- concurrency behavior;
- error/failure semantics;
- data migration/compatibility;
- runtime/build boundary;
- architecture.

Ask:

> **Did the fix restore the violated property without creating a new way to violate another one?**

Small local corrections with no relevant semantic change do not require a full additional review cycle.

---

## 17. Human final review and merge

The human remains the final authority.

Before merge, confirm:

- Mission acceptance criteria are satisfied;
- BLOCKER findings are resolved;
- accepted SHOULD FIX findings are resolved or consciously deferred;
- evidence is sufficient for the risk level;
- scope remains controlled;
- no unresolved architectural conflict remains.

Then squash / merge according to repository conventions.

---

## 18. Learning capture

After meaningful findings, decide whether the project should retain the lesson.

Possible destinations:

- test suite;
- schema/static validation;
- runtime guard;
- ADR/convention;
- Issue template;
- review heuristic;
- workflow update.

The goal is to move known failure modes from repeated human/agent reasoning into durable project knowledge or automation.

A useful loop is:

```text
AGENT / HUMAN discovers missing property
        ↓
HUMAN validates its importance
        ↓
property becomes explicit
        ↓
AUTO defends it when practical
```

---

## 19. Risk-based use of Codex

Codex remains selective.

### Planning review is valuable when

- architecture can be wrong by construction;
- framework/runtime behavior is easy to misunderstand;
- a contract spans multiple subsystems;
- the design is expensive to reverse.

### Code/evidence review is valuable when

- green CI may hide semantic failure;
- state or persistence has non-trivial failure modes;
- a fix changed semantics;
- the implementation crossed an operational/provider boundary;
- emitted artifacts matter;
- the diff is difficult to reason about from the implementer's path alone.

### Codex is usually unnecessary when

- the change is local and mechanically constrained;
- the relevant properties are already strongly defended by AUTO;
- failure cost is low;
- an independent reasoning path is unlikely to add meaningful information.

---

## 20. What this workflow deliberately does not do

It does not require:

- Codex on every task;
- a new ADR for every decision;
- exhaustive edge-case enumeration;
- a separate invariants document;
- a separate evidence document;
- unit tests for every property;
- reopening frozen product decisions during review;
- turning review into speculative refactoring.

The workflow increases rigor by improving **traceability and evaluation**, not by multiplying documents.

---

## 21. Compact operational model

```text
Henrique + Friday
    │
    ├── problem / product decision
    └── Mission / Issue
             │
             ▼
          Claude
    repository baseline
    contract analysis
    invariant discovery
    implementation plan
             │
             ▼
   Friday + Henrique (+ Codex)
          PLAN REVIEW
             │
          APPROVED
             │
             ▼
          Claude
      IMPLEMENTATION
      + SELF-VALIDATION
      + EVIDENCE
             │
             ▼
            PR
             │
             ▼
   Friday + Henrique (+ Codex)
    INDEPENDENT EVALUATION
             │
        fixes / delta review
             │
             ▼
          Henrique
       FINAL DECISION
             │
             ▼
           MERGE
             │
             ▼
      LEARNING CAPTURE
```

---

## 22. Definition of a healthy workflow

The workflow is working when:

- the implementation agent cannot silently redefine success;
- Mission and acceptance criteria exist before implementation;
- relevant architecture contracts reach the plan and evidence;
- new system invariants are surfaced when the task exposes them;
- happy-path success is not treated as sufficient proof for stateful or failure-sensitive behavior;
- automated checks defend known properties where practical;
- independent review is used where it has concrete value;
- fixes are checked for second-order effects when semantics change;
- humans retain product and merge authority;
- process cost remains proportional to change risk.

---

## 23. Failure conditions

The workflow is failing if:

- Claude defines acceptance criteria after seeing its implementation;
- the Mission becomes a disguised Implementation Plan;
- every task requires multiple agents regardless of risk;
- review produces speculative redesign instead of evaluating the agreed contract;
- existing ADR/contracts are routinely lost between architecture and task execution;
- invariants become a generic edge-case checklist with no relation to the system;
- evidence consists only of “tests are green” when the claimed property is not represented by those tests;
- findings are repeatedly rediscovered but never converted into durable knowledge;
- governance becomes more expensive than the risks it removes.

---

## 24. Frozen summary

Developer OS v2.0 separates four different responsibilities that must not collapse into one agent loop:

1. **Mission** — humans define what must become true and how acceptance will be judged.
2. **Contract + invariant analysis** — planning recovers existing properties and discovers new ones exposed by the change.
3. **Implementation + evidence** — Claude builds the approved solution and produces concrete evidence.
4. **Independent evaluation + human decision** — reviewers evaluate against the Mission and repository contracts; the human decides whether the work is acceptable.

The central reliability chain is:

```text
MISSION
   ↓
CONTRACTS + INVARIANTS
   ↓
IMPLEMENTATION
   ↓
EVIDENCE
   ↓
INDEPENDENT EVALUATION
   ↓
HUMAN ACCEPTANCE
```

> **A critical property should either already be protected, be explicitly carried into the change, or be discovered before acceptance. It must not depend on the implementation agent accidentally remembering it.**

