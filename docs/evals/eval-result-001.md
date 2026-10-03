# Eval Case 001 — Result

## Metadata

- Protocol at execution: `evaluation_protocol_v1`
- Current protocol: `evaluation_protocol_v2`
- Mission source: GitHub Issue #76 — Responsive header: keep the Home header usable at reduced widths
- Initial implementation PR: #78
- Final selected implementation PR: #79
- Status: Closed
- Historical eval outcome: FAIL

## Scope of this record

This file records the outcome and lessons of Eval Case 001.

It does not replace:
- the GitHub Issue as the source of truth for the mission;
- the Implementation Plan published in the issue;
- the evaluator reports;
- the PR discussion and evidence.

The historical result must not be rewritten based on later remediation or product decisions.

## Initial execution

The first implementation used a deterministic 3+2 grid for the Home header navigation below `md`.

The implementation:
- solved the irregular wrapping problem;
- preserved desktop behavior;
- remained within scope;
- introduced no relevant functional regression;
- passed test, typecheck and build validation.

However, the evaluator identified that the explicit acceptance criterion requiring visible keyboard focus was not satisfied.

### Historical outcome

`FAIL`

The failure was not caused by a regression introduced by the responsive-header patch.

The focus defect already existed in the baseline and was discovered during evaluation.

## Failure analysis

### Immediate failure

Visible focus was missing on the Home header wordmark and navigation links.

### Failure origin

`PREEXISTING_BASELINE`

The underlying defect existed before the evaluated implementation.

### Process failure

The planning phase assumed that the existing `FOCUS_RING` already provided visible focus and treated it as a preserved constraint without verifying that assumption against the baseline.

This was classified in `evaluation_protocol_v1` as `REASONING_ERROR`, while also revealing that the v1 taxonomy did not adequately represent preexisting baseline defects.

## Remediation

A remediation cycle removed the conflicting `outline-none` behavior from the Home header focus-ring classes.

The remediation:
- restored visible focus on the wordmark and navigation links;
- preserved keyboard order and semantics;
- introduced no relevant layout regression;
- preserved test, typecheck and build success.

### Remediation verification

`REMEDIATION VERIFIED WITH RESERVATION`

The technical blocker was corrected.

The reservation concerned evidence publication: some raw browser-validation artifacts remained local rather than being fully attached to the PR.

The historical Eval Case 001 outcome remained `FAIL`.

## Human experience gate

After the technical remediation, the responsive-header solution was still subject to a human visual decision.

Two implementations were compared:

### Alternative A

Deterministic 3+2 navigation grid below `md`.

Advantages:
- very small implementation;
- no additional client state;
- robust no-JS behavior;
- minimal maintenance surface.

Trade-off:
- the header remained visually dominant on reduced widths and consumed significant vertical space before the hero.

### Alternative B

Compact header with:
- wordmark;
- visible ThemeControl;
- menu toggle;
- collapsible primary navigation.

Advantages:
- substantially reduced closed-header height;
- restored visual hierarchy by keeping the hero as the primary focus of the first viewport.

Trade-offs:
- additional state and interaction logic;
- more SSR/hydration surface;
- one extra interaction to reach navigation destinations;
- known non-blocking risks around pre-hydration interaction and complete bundle failure.

### Human decision

Alternative B was selected.

Reason:

The compact header better preserves the intended visual hierarchy on reduced widths. Navigation remains secondary to the hero instead of competing with it for first-viewport attention.

The rejected Alternative A PR was closed without merge.

The selected Alternative B was merged through PR #79.

## What worked in the process

1. Planning, implementation and evaluation remained separate roles.
2. The planner and implementer did not decide their own PASS / FAIL outcome.
3. The independent evaluator used frozen criteria while remaining free to identify evidence-backed problems that were not anticipated by the implementer.
4. The process distinguished:
   - patch quality;
   - mission completion;
   - remediation;
   - human merge decision.
5. CI success was not treated as equivalent to mission success.
6. Human aesthetic judgment remained outside the evaluator's authority.
7. Codex worked effectively as an independent evaluator.

## What failed or was weak

1. `evaluation_protocol_v1` did not explicitly classify the origin of a failure.
2. The baseline was not required to be verified against every relevant acceptance criterion before implementation.
3. Some evidence remained local and was therefore less auditable from the PR alone.
4. The planning phase assumed that an existing focus-ring abstraction worked without verifying it.
5. Subjective product quality cannot be fully resolved by implementation metrics or automated evaluation.

## Protocol changes resulting from this case

Eval Case 001 directly motivated `evaluation_protocol_v2`.

The new protocol introduced:

- explicit baseline verification;
- a separate failure-origin dimension;
- `PREEXISTING_BASELINE` and other origin classifications;
- a Human Experience Gate;
- an Evidence Publication Gate;
- stronger separation between:
  - technical evaluation;
  - remediation;
  - product judgment;
  - merge decision.

## Carry-forward lessons

For future eval cases:

1. Verify relevant baseline constraints before assuming they are already satisfied.
2. Preserve separation between planner, implementer and evaluator.
3. Do not let the implementer self-declare PASS / FAIL.
4. Require evidence to be published when it materially supports the evaluator's conclusion.
5. Keep subjective visual/product judgment in the human gate.
6. Do not treat a historical FAIL as something to rewrite after remediation.
7. Use remediation to improve the product, not to retroactively improve the evaluation result.

## Closure

Eval Case 001 is closed.

Historical outcome:

`FAIL`

Product outcome:

The blocking technical defect was remediated, Alternative B was selected through the human visual gate, and the final responsive-header implementation was delivered through PR #79.

Protocol outcome:

The lessons from this case were incorporated into `evaluation_protocol_v2`.