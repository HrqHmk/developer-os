# Eval Case 002 — Result

## Metadata

- Protocol at execution: `evaluation_protocol_v2`
- Current protocol: `evaluation_protocol_v2`
- Mission source: GitHub Issue #80 — Focus ring bug
- Implementation PR: #82
- Status: Ready for merge
- Eval outcome: PASS

## Scope of this record

This file records the outcome and lessons of Eval Case 002.

It does not replace:
- the GitHub Issue as the source of truth for the mission;
- the frozen Task Contract;
- the Implementation Plan;
- the implementer's Evidence Pack;
- the independent evaluator report;
- the PR discussion and evidence;
- the Human Experience Gate.

The evaluation result records whether the implementation satisfied the frozen mission criteria. The final merge decision remains human.

## Initial execution

The implementation addressed the broken focus-ring behavior affecting the interactive consumers identified in Issue #80.

The implementation removed the conflicting `outline-none` behavior from the shared `FOCUS_RING` classes used by the affected Home page consumers.

The production change was intentionally minimal:
- one production file changed;
- no semantic or routing changes;
- no design-token changes;
- no spacing or component-structure changes;
- no unrelated refactor.

The implementer identified the root cause as an interaction between `outline-none` and the Tailwind-generated outline style used by the `focus-visible` utilities.

Automated validation passed:
- 19 test files;
- 156 tests;
- typecheck;
- production build and prerender.

Because automated tests do not provide sufficient evidence for rendered focus behavior, browser evidence was required by the frozen Task Contract.

## Independent evaluation

Codex acted as the independent evaluator.

The evaluator independently inspected the repository and reproduced the relevant behavior using Google Chrome.

Verification included:
- actual keyboard Tab traversal;
- all six affected consumers;
- Light mode;
- Dark mode;
- computed `:focus-visible` state;
- `outline-style`;
- outline width;
- outline offset;
- ring color/token;
- box shadow;
- pointer focus;
- reduced and desktop viewport checks;
- layout and clipping behavior;
- test, typecheck and build validation.

### Acceptance criteria outcome

All 10 frozen acceptance criteria passed.

The evaluator independently observed that keyboard focus produced:

- `outline-style: solid`;
- `outline-width: 2px`;
- `outline-offset: 2px`;
- the expected `--color-ring` value for the active theme;
- no competing box shadow.

Pointer focus did not receive the keyboard `focus-visible` treatment.

All six current consumers identified by the mission were verified.

No relevant layout or clipping regression was observed.

### Independent evaluator outcome

`PASS`

### Confidence

`HIGH`

## Evidence Pack audit

The implementer produced an Evidence Pack containing:
- the production diff;
- root-cause analysis;
- automated validation;
- browser computed-style evidence;
- Light and Dark verification;
- keyboard and pointer verification;
- layout measurements;
- screenshots;
- an acceptance-criteria matrix;
- explicit deviations and uncertainties.

However, the implementer's Evidence Pack was not available to the independent evaluator during its execution.

As a result, Codex reconstructed the critical evidence independently rather than auditing the implementer's artifacts directly.

This reduced direct cross-auditability between the two reports, but it also provided strong independence between implementation self-reporting and final technical evaluation.

The evaluator was able to reproduce the critical behavioral claims without relying on the implementer's conclusions.

## Human experience gate

After the independent technical PASS, the implementation was exposed through the PR preview for human inspection.

The focus behavior was reviewed visually before merge.

Particular attention was given to:
- the rendered focus ring;
- keyboard interaction;
- the visual result of the About link;
- overall consistency with the existing interface.

### Human decision

`PASS`

No visual or product-quality concern was identified that should block delivery.

## Findings

### Blocking findings

None.

### Non-blocking findings

- The evaluator found unrelated untracked `.claude/` and `.vercel/` directories in the working tree; they were not part of the evaluated production diff.
- The Hero contains an `overflow-hidden` ancestor, but the evaluator verified sufficient clearance for the complete focus outline at the tested viewports.
- Existing jsdom `HTMLFormElement.requestSubmit()` informational messages remained present during automated validation but did not affect test success.

### Residual uncertainty

- Independent browser verification used Google Chrome.
- Firefox and Safari were not independently tested.
- The evaluator did not launch the pre-change revision for a browser side-by-side capture; the baseline failure mechanism was verified through the original class combination and generated CSS.
- The implementer's Evidence Pack was not available to the independent evaluator for direct comparison.

None of these uncertainties demonstrated a violation of the frozen Task Contract.

## Process observations

### What worked

1. The mission criteria were frozen before implementation.
2. The implementer did not assign the final PASS / FAIL verdict.
3. Automated success was not treated as sufficient evidence for browser behavior.
4. The implementer collected real-browser evidence.
5. The independent evaluator reproduced the critical behavior rather than relying on implementation claims.
6. The evaluator actively checked keyboard and pointer modality, Light and Dark themes, all affected consumers, clipping and layout.
7. The evaluator distinguished demonstrated defects from residual uncertainty.
8. The Human Experience Gate remained separate from the technical evaluation.
9. The merge decision remained human.

### What was weak

1. The Implementation Plan was not persisted as a durable Issue artifact before implementation.
2. The implementer's Evidence Pack was not supplied to the independent evaluator.
3. Because of that, the evaluator could independently verify the product state but could not directly audit discrepancies between its evidence and the implementer's evidence.

Neither process weakness invalidated the technical result of this case.

## Protocol lessons

Eval Case 002 provides the first practical validation of the `evaluation_protocol_v2` flow after the lessons from Eval Case 001.

The case demonstrated that:

1. Frozen behavioral criteria can support independent evaluation of a very small implementation.
2. A one-line change still benefits from evidence proportional to the type of risk being evaluated.
3. Browser-dependent acceptance criteria require browser evidence even when test, typecheck and build are green.
4. Independent reproduction provides stronger evidence than implementer self-reporting alone.
5. `PASS` can be justified by positive evidence rather than by the absence of reported defects.
6. Residual uncertainty should remain visible without automatically becoming a failure.
7. Human visual judgment remains a separate gate even after a high-confidence technical PASS.

### Carry-forward process adjustment

For future eval cases:

- persist the Implementation Plan before implementation begins;
- make the implementer's Evidence Pack explicitly available to the evaluator;
- preserve independent reproduction rather than allowing the evaluator to rely solely on that Evidence Pack.

This allows future evaluations to contain both:
- independent verification;
- direct audit of the implementer's evidence.

## Closure

Eval Case 002 is technically complete.

Eval outcome:

`PASS`

Human Experience Gate:

`PASS`

Merge state:

`READY`

The frozen Task Contract was satisfied with high-confidence independent evidence.

The final merge remains a human repository decision.