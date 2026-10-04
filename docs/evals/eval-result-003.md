# Eval Case 003 — Result

## Metadata

- Protocol at execution: `evaluation_protocol_v2`
- Current protocol: `evaluation_protocol_v2`
- Mission source: GitHub Issue #83 — Make Brazilian Portuguese a first-class language alongside English
- Implementation PR: #84
- Baseline commit: `4d4f2fce9c803a494448cc4130076d8e39528600`
- Evaluated head: `baf83c912c0073433e9f1315b60c2e55a37c3f6e`
- Status: Ready for merge
- Initial evaluator outcome: `PASS WITH CONDITIONS`
- Human Experience Gate: `PASS`
- Remediation cycle: Not required

## Scope of this record

This file records the outcome and lessons of Eval Case 003.

It does not replace:
- the GitHub Issue as the source of truth for the mission;
- the baseline verification;
- Implementation Plan v1;
- Implementation Plan v2;
- the implementation PR and published evidence;
- the independent evaluator report;
- the Human Experience Gate;
- ADR-0011.

The initial evaluator verdict is preserved as originally issued.

Human resolution of the evaluator's conditions does not retroactively rewrite `PASS WITH CONDITIONS` into `PASS`.

The final merge decision remains human.

## Mission

The mission was to make Brazilian Portuguese a first-class language in Developer-OS without relying on browser-provided automatic translation.

The product intent was driven by Developer-OS increasingly becoming a professional showcase for a Brazil-based owner whose native language is PT-BR.

The mission required the site to feel like the same Developer-OS product intentionally available in both English and Brazilian Portuguese, while preserving the existing English experience.

## Baseline verification

Before planning and implementation, the current `main` branch was frozen and verified at:

`4d4f2fce9c803a494448cc4130076d8e39528600`

Automated baseline validation passed:

- 19 test files;
- 156 tests;
- typecheck;
- production build.

The baseline inventory identified:

- 12 public content URLs;
- 21 content items;
- two dynamic route families;
- the 404 surface;
- `/rss.xml`;
- shared visitor-facing UI and metadata surfaces.

### Pre-existing baseline findings

The baseline verification also recorded:

1. `<html>` had no `lang` attribute.
2. One Blog article contained a duplicated `<h1>`.
3. `/uses`, `/architecture` and `/changelog` had no inbound navigation links.
4. Per-page metadata coverage was inconsistent.
5. The 404 page used the framework-default minimal presentation.
6. Vitest emitted jsdom `requestSubmit()` warnings while still passing.

Only the missing document language was directly required to change by the mission.

The other findings remained visible so the evaluator could distinguish pre-existing behavior from regressions introduced by the implementation.

## Planning

The first Implementation Plan proposed the main language architecture and surfaced several product and technical decisions.

Human review then resolved the remaining product questions before implementation.

A second plan was published without modifying the first one, preserving the audit trail.

### Final human decisions before implementation

The approved decisions were:

- English remains at the existing root URLs.
- PT-BR uses `/pt-br/...`.
- PT-BR preserves the same path segments and slugs as English.
- No browser-language detection.
- No automatic redirect.
- No persisted language preference.
- The URL is the source of truth for language.
- All first-party public Developer-OS content must maintain EN/PT-BR parity.
- Missing first-party translations fail loudly instead of silently falling back.
- Product names, proper nouns, technical terms, shared brand assets and third-party surfaces are not required to be translated.
- The existing `/rss.xml` remains English-only.
- No `/pt-br/rss.xml` is introduced.
- PT-BR pages do not advertise the English RSS feed.
- URL fragments and Search state do not need to survive a language switch.
- No Playwright or other permanent E2E framework is introduced by this mission.
- Browser-dependent behavior is verified through a reproducible manual run against the built preview.
- The existing Open Graph image remains a shared brand asset.
- ADR-0011 is created as `Proposed` and remains subject to the Human Experience Gate before promotion to `Accepted`.

## Implementation

The implementation was delivered in PR #84.

The final implementation included:

- explicit mirrored PT-BR routes under `/pt-br`;
- preservation of all existing English URLs;
- a visible EN ↔ PT-BR language switch;
- complete translation of the baseline first-party public content;
- translated page/interface copy;
- translated Blog, Project and Changelog Markdown;
- localized Learning and Uses structured data;
- build-time content parity enforcement;
- type-level interface-copy parity;
- separate Search indexes per language;
- locale-aware document language;
- hreflang metadata;
- localized titles;
- localized descriptions where descriptions already existed in the baseline;
- localized Home social metadata;
- shared Open Graph image;
- English-only RSS behavior preserved;
- localized 404 content while retaining HTTP 404 semantics;
- locale-aware date formatting;
- ADR-0011;
- synchronized architecture and conventions documentation.

No automatic translation service, CMS, backend translation service, extra language, permanent E2E framework or unrelated redesign was introduced.

## Validation

Automated validation after implementation passed:

- 23 test files;
- 204 tests;
- typecheck;
- production build;
- Workers build.

Existing test assertions were preserved.

Browser-dependent verification against the built preview covered:

- all EN and PT-BR public routes;
- direct navigation;
- reload;
- EN ↔ PT-BR switching;
- keyboard operation;
- visible focus;
- responsive behavior;
- mixed-language checks;
- metadata;
- 404 behavior.

The implementation also deliberately verified that removing a required PT-BR content file caused the build to fail.

## Technical hypotheses

Several planning hypotheses were intentionally left for execution-time verification.

### Confirmed

- H2 — typed localized links work with the selected route structure.
- H3 — nested PT-BR static routes participate in automatic prerender discovery.
- H5 — localized 404 content can retain HTTP 404 semantics.
- H6 — the English RSS alternate link can remain available only on English pages.
- H8 — existing metadata assertions could be preserved.

### Closed by human decision

- H1 — third-party Buttondown surfaces are outside first-party translation parity.
- H4 — no permanent E2E framework is required for this mission.

### Falsified

- H7 — the closed Home header does not remain on one row at the narrowest widths after adding the language switch.

At 320px, 360px and 375px, the language switch and Theme selector wrap to a second row.

At approximately 414px and above, the header fits on one row.

No horizontal overflow, clipping, inaccessible control or broken navigation was demonstrated.

The implementer did not silently redesign the header after discovering the false hypothesis.

The implementation was frozen and the trade-off was passed to independent evaluation and then to the Human Experience Gate.

## Independent evaluation

Codex acted as the independent evaluator.

The evaluator inspected:

- the frozen Issue;
- baseline verification;
- Plan v1;
- Plan v2;
- human planning decisions;
- PR diff;
- implementation commits;
- tests;
- CI;
- build behavior;
- published route/content coverage;
- browser-verification results;
- representative screenshots;
- documentation;
- ADR-0011.

The evaluator did not modify the implementation.

### Acceptance criteria outcome

All 11 acceptance criteria were considered satisfied objectively or satisfied subject to human review.

The evaluator recorded:

- AC1 — PASS
- AC2 — PASS WITH CONDITION
- AC3 — PASS
- AC4 — PASS
- AC5 — PASS
- AC6 — PASS
- AC7 — PASS
- AC8 — PASS
- AC9 — PASS
- AC10 — PASS WITH CONDITION
- AC11 — PASS

The two conditional criteria depended on native-speaker evaluation of PT-BR quality rather than a demonstrated structural implementation defect.

The narrow Home-header behavior did not fail AC9 because the measurable requirements remained satisfied:
- no unintended overflow;
- no clipping;
- no broken navigation.

### Independent evaluator outcome

`PASS WITH CONDITIONS`

### Failure taxonomy

No material failure taxonomy was assigned.

The evaluator found no supported basis for:

- `SPEC_AMBIGUITY`
- `MISSING_CONTEXT`
- `SCOPE_CREEP`
- `REASONING_ERROR`
- `WEAK_TEST`

### Failure origin

The H7 visual-layout change was classified as:

`INTRODUCED_BY_CHANGE`

but not as an objective mission failure.

Documented baseline defects remained:

`PREEXISTING_BASELINE`

where applicable.

## Evidence audit

Evidence quality was strong overall.

Auditably available evidence included:

- frozen Issue and criteria;
- baseline record;
- Plans v1 and v2;
- human planning decisions;
- implementation diff;
- exact commit history;
- CI;
- tests;
- coverage mapping;
- browser-verification script and summarized results;
- metadata excerpts;
- representative screenshots.

### Evidence limitations

The evaluator identified two useful evidence-process weaknesses:

1. The generated raw browser result JSON was not published.
2. Some screenshots labeled as narrow Article/Search evidence were embedded at 1280×900 and therefore did not independently prove the narrow presentation.

Neither weakness was strong enough to invalidate the outcome because the relevant behavior was also supported by reproducible verification and other published evidence.

For future eval cases, raw browser-verification artifacts should be published when available.

## Human Experience Gate

The evaluator explicitly deferred two decisions to the Human Experience Gate.

### 1. Narrow Home header

The human gate reviewed the two-row narrow header presentation.

Decision:

`ACCEPTED`

The visual trade-off was considered acceptable.

No remediation cycle was requested.

### 2. PT-BR editorial quality

The human gate reviewed the translated first-party content and interface copy as a native PT-BR speaker.

Decision:

`ACCEPTED`

The translations were considered appropriate for Developer-OS as a professional showcase.

No translation remediation cycle was required.

### Human Experience Gate outcome

`PASS`

## ADR-0011

ADR-0011 was correctly created with status:

`Proposto`

during implementation.

The architecture was validated through implementation, automated checks, browser verification, independent evaluation and the Human Experience Gate.

After case closure, ADR-0011 is eligible for promotion to:

`Aceito`

subject to the normal human repository decision.

## Findings

### Blocking findings

None after Human Experience Gate resolution.

### Non-blocking findings

- The narrow Home header changed from one row to two rows below approximately 414px.
- Client JavaScript increased because both locale snapshots are currently packaged together.
- Raw browser-verification JSON was not published.
- Some screenshots labeled as narrow were not actually captured/embedded at narrow dimensions.
- Existing baseline defects intentionally outside mission scope remain present.

### Residual uncertainty

- Production behavior on `developeros.dev` was not part of the eval verification; verification used the built preview.
- Screen-reader announcement behavior was not independently tested.
- Browser verification focused on Chrome.
- Translation parity tooling can detect missing structural equivalents but cannot prove future prose equivalence or editorial quality.

None of these residual uncertainties demonstrated a violation of the frozen mission.

## Process observations

### What worked

1. The Issue was established as the mission source before implementation.
2. The Eval Case record was created at the beginning of the case rather than only at closure.
3. Baseline verification happened before planning.
4. Pre-existing defects were explicitly recorded before implementation.
5. Planning distinguished repository facts, decisions and hypotheses.
6. Plan v1 was preserved when human review required Plan v2.
7. Human product decisions were resolved before implementation instead of being silently delegated to the implementer.
8. Implementation-time technical hypotheses remained visible.
9. When H7 proved false, the implementer stopped short of silently redesigning the product.
10. The execution was frozen before independent evaluation.
11. The evaluator received the mission, baseline, plan, implementation and published evidence.
12. Green CI was treated as supporting evidence rather than proof of mission success.
13. The evaluator distinguished an introduced visual trade-off from an objective acceptance-criterion failure.
14. Human visual and editorial judgment remained separate from technical evaluation.
15. The original `PASS WITH CONDITIONS` verdict remained frozen after the Human Experience Gate.
16. No remediation cycle was created when the human gate accepted both outstanding conditions.

### What was weak

1. The initial baseline-verification instruction was overly operational and briefly created ambiguity about whether implementation work should begin.
2. The workflow needed an explicit interruption to reinforce that baseline verification means observation only.
3. Some product questions remained open after Plan v1 and required a second human-gate planning pass.
4. Implementation commit order diverged from the planned slice order, reducing traceability between plan slices and commits.
5. Raw browser-verification output was not retained as a published artifact.
6. Two screenshots were mislabeled as narrow despite being embedded at desktop dimensions.
7. The process still relied on manual human assembly/publication of some visual evidence.

None of these weaknesses invalidated the technical or product result.

## Protocol and workflow lessons

Eval Case 003 provides a broader validation of `evaluation_protocol_v2` than Eval Case 002 because it exercised:

- a larger feature;
- baseline inventory;
- content migration;
- route architecture;
- metadata;
- accessibility;
- responsive behavior;
- build-time invariants;
- human product decisions;
- implementation-time hypotheses;
- independent evaluation;
- Human Experience Gate.

The case demonstrated that:

1. Baseline verification materially improves failure-origin analysis.
2. A baseline record should remain strictly observational.
3. The Eval Case record should be created when the experiment begins, not as closing documentation.
4. Preserving Plan v1 and publishing Plan v2 creates a useful audit trail of human intervention.
5. Product decisions should be removed from the technical hypothesis set before implementation.
6. Technical hypotheses can legitimately remain unresolved until execution if their fallback boundaries are clear.
7. A falsified hypothesis does not automatically imply mission failure.
8. An agent stopping instead of silently redesigning after a false hypothesis is desirable workflow behavior.
9. Human Experience Gate is especially useful when measurable behavior passes but visual/product preference remains.
10. Structural translation parity and editorial translation quality are different concerns and require different evidence.
11. Evidence should be representative, not excessive, but labels and dimensions must accurately describe what is shown.
12. Reproducible browser verification is useful evidence even without introducing a permanent E2E framework.
13. Raw verification artifacts improve auditability and should be retained when practical.
14. Initial evaluator outcomes should remain frozen even when later human conditions are resolved.
15. Eval quality depends on the orchestration system as a whole, not only on implementation-agent performance.

## Carry-forward process adjustments

For future eval cases:

- create `eval-case-00X.md` immediately after the mission Issue is created and frozen;
- make baseline prompts explicitly observation-only;
- use a short baseline rule: observe, run approved checks, record, stop;
- prohibit implementation, refactoring and remediation during baseline verification;
- explicitly separate unresolved human decisions from implementation-time technical hypotheses;
- preserve superseded plans instead of silently editing them;
- require significant plan revisions to be published as a new plan version;
- freeze execution before independent evaluation;
- publish representative screenshots before invoking the evaluator;
- validate screenshot viewport/dimensions before labeling them;
- publish raw browser-verification artifacts when available;
- keep Human Experience Gate decisions separate from the frozen evaluator verdict;
- record workflow deviations regardless of whether they originate from the agent, the orchestration prompt or the human operator.

## Closure

Eval Case 003 is technically complete.

Initial independent evaluator outcome:

`PASS WITH CONDITIONS`

Human Experience Gate:

`PASS`

Conditions resolved:

- narrow Home header: `ACCEPTED`
- PT-BR editorial quality: `ACCEPTED`

Remediation cycle:

`NOT REQUIRED`

Merge state:

`READY`

ADR-0011:

`ELIGIBLE FOR ACCEPTED`

The frozen mission was satisfied with strong independent evidence and the outstanding human product/editorial conditions were explicitly resolved.

The final merge remains a human repository decision.