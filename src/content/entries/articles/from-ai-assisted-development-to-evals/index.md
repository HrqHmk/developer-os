---
title: "From AI-Assisted Development to Evals: What I Learned from Three Real Cases"
description: "How I started turning development tasks with AI agents into evaluable experiments, with explicit criteria, evidence, and human decisions, based on three real cases in Developer OS."
publishedAt: "2026-10-11"
---

*How I started turning development tasks with AI agents into evaluable experiments, with explicit criteria, evidence, and human decisions.*

## The problem was never getting AI to write code

When I started building Developer OS, my main concern was finding a way to use AI agents without losing control over technical decisions.

The process began fairly simply: one agent planned and implemented, another performed independent reviews, and the final decision remained human.

That separation produced interesting results.

While building the Blog, for example, an independent review found that the proposed approach could violate an architectural decision of the project: content had to be processed at build time, not at runtime.

The problem was caught before any code was written.

At another point, an implementation passed the tests, the typecheck, and the build, but the review found problems with date validation, timezones, and filesystem error handling.

The automation was green. That didn't mean the implementation was correct.

These episodes strengthened my confidence in independent review, but they also made me realize a limitation in the process.

**I had mechanisms for finding errors, but I still didn't have a sufficiently structured system for evaluating agent runs.**

That was the context in which I started studying Evals.

## From code review to agent evaluation

A traditional review tries to identify problems in an implementation.

An Eval, in the sense I'm exploring, has to answer a broader set of questions:

- Did the agent fulfill the requirements of the mission?
- Which criteria were satisfied?
- What evidence supports that conclusion?
- What failures were found?
- Were those failures introduced by the implementation, or did they already exist?
- How much human intervention was needed?

The difference matters.

I don't just want to know whether the code that was produced works. I want to understand the behavior of the AI-assisted development system.

To do that, I started formalizing an evaluation protocol in Developer OS.

The unit of evaluation became a real mission of the project, usually represented by a GitHub Issue.

Before implementation, I define the contract: requirements, acceptance criteria, constraints, and expected evidence.

The agent responsible for planning has the autonomy to propose the technical approach. The implementer executes. An independent evaluator verifies the result.

And decisions that require product judgment, risk acceptance, or scope changes remain human.

The goal is not to control every step of the agent.

It is to establish verifiable boundaries for the work it does.

## Case 001 — A FAIL that exposed a flaw in the protocol itself

The first formal Eval had an interesting result: **FAIL**.

The main feature had been implemented and worked, but one of the accessibility criteria was not satisfied.

The most important detail appeared while analyzing the failure.

The problem already existed in the project's baseline, before the implementation being evaluated.

This created a distinction that my initial protocol did not handle properly.

The outcome of the mission could be considered FAIL because the acceptance contract had not been fully satisfied.

But it would be wrong to conclude, from that result, that the implementing agent had introduced that defect.

Those are different claims.

One describes the outcome of the evaluation.

The other attributes the origin of a failure.

This discovery showed me that I needed to improve not only the implementation, but the evaluation system itself.

The retrospective of the first case led to the creation of **Evaluation Protocol v2**.

Among the most important changes were:

- Explicit baseline verification before implementation.
- Separation between the type of a failure and its origin.
- Requirements for published, auditable evidence.
- A stricter separation between the responsibilities of the implementer and the evaluator.
- A reserved space for human evaluations of experience and product decisions.

I also established that new versions of the protocol should not retroactively change earlier results.

An Eval has to preserve the context in which it was run. Otherwise, the history loses part of its value.

The first FAIL, then, produced two results: it revealed an unsatisfied criterion and exposed a deficiency in how I was evaluating.

The second result was probably the more important one at that moment.

## Case 002 — Fixing the defect with a more mature contract

The second case grew directly out of the first.

The mission was to fix the accessibility problem identified earlier.

This time, though, the process already had the improvements introduced in the protocol.

The baseline became an explicit reference.

Evidence of behavior in the browser gained importance, instead of relying solely on automated tests or on the agent's own statements.

The independent evaluation also remained separate from the implementation.

The result was **PASS**.

But the lesson was not simply that the second agent got it right while the first got it wrong.

The missions were different, and the results don't allow that direct comparison.

What the second case demonstrated was the practical application of the governance improvements: a known defect was handled with clearer criteria, observable evidence, and independent verification.

The process also began to produce something I consider important: traceability.

It became possible to connect the problem that was found, the mission created to resolve it, the work that was carried out, and the evaluation result.

Each run stopped being just a change in the repository and became a contribution to the project's engineering history.

## Case 003 — When the evaluation had to keep up with a larger product change

The third Eval considerably expanded the scope.

The mission was to make Developer OS bilingual, treating PT-BR as a native experience, not a secondary translation.

This decision affected different parts of the project:

- Route structure and navigation.
- Organization and availability of content in both languages.
- Metadata and SEO behavior.
- Search.
- Accessibility.
- Responsiveness.
- Product experience and presentation decisions.

This kind of mission is interesting because it can't be properly evaluated just by checking that the project compiles.

An application can pass the build and still have incorrect links, content unavailable in a given language, or navigation inconsistencies.

In addition, some decisions involve human judgment.

A change can be technically valid and still not deliver the experience I want for the product.

It was in this third case that the separation of responsibilities began to make more sense to me.

The Issue established the problem, the constraints, and the acceptance criteria.

The planner could investigate the repository and choose the approach.

The implementer had the autonomy to carry out the solution.

The evaluator had to produce a judgment grounded in evidence, without simply accepting the implementer's claims.

And I remained responsible for product decisions and for criteria that required human evaluation.

**The gain in control didn't come from restricting the agents' technical autonomy. It came from better defining responsibilities, contracts, and evidence.**

That distinction changed how I started thinking about orchestration.

## Governance is not micromanagement

There is a natural temptation to improve AI results by writing increasingly detailed instructions.

That can work in some situations, but it can also turn the specification into a disguised implementation.

If I already determine the entire architecture, every data structure, and every technical decision, the agent's room to reason shrinks.

The path I'm exploring is different.

I want to specify the problem precisely enough to evaluate the result, without unnecessarily anticipating the solution.

That means establishing what has to be true at the end of the mission.

It also means identifying which decisions belong to the agents and which remain a human responsibility.

In practice, my current flow can be summarized like this:

**Mission contract → Planning → Implementation → Independent evaluation → Human decision → Retrospective**

The flow doesn't need to have the same complexity for every task. Additional reviews should be proportional to risk, and governance can't become a bigger obstacle than the problem it aims to solve.

The goal is still to build software.

The protocol exists to increase confidence in the process, not to create bureaucracy around it.

## The next challenge: turning runs into data

The three cases also revealed an opportunity that I intend to explore in the next experiments.

I want to start accumulating structured data about agent performance on real missions.

Not just binary PASS or FAIL results.

I want to identify patterns such as:

- Which types of mission show more failures?
- Which categories of error appear most frequently?
- At which stages does independent review add the most value?
- How much human intervention does each mission require?
- Which failures are caught by the evaluator, and which reach human review?
- How does the protocol evolve as new problems appear?

To that end, I'm working on classifying failures by type, severity, and detection mechanism, while keeping information about their origin separate.

That separation is essential to avoid misleading conclusions.

A FAIL caused by a pre-existing problem in the baseline should not be counted the same way as a defect introduced by the agent.

Likewise, an implementer failure and a failure of the evaluation process are not the same thing.

If the agent delivers an insufficient test, there is a problem in the artifact it produced.

If my evaluation system accepts that test as sufficient evidence and lets a defect through, there is also a question about the effectiveness of the Eval itself.

These are dimensions that need to be observed separately.

I don't yet have enough data to draw statistical conclusions.

Three cases are a small sample, with different missions and a protocol that evolved along the way.

Directly comparing their results would be premature.

But there is already the beginning of a history, and that changes what I can learn from the next experiments.

## Conclusion — The Eval also has to evolve

When I started studying Evals, my initial expectation was to improve my ability to identify problems in the code produced by agents.

The first experiments broadened that perspective.

I realized that I also needed to evaluate the quality of the criteria, the reliability of the evidence, and the way I interpret the results.

The first case showed that a FAIL can hide different causes.

The second showed the value of an explicit baseline and verifiable evidence.

The third extended the process to a product change with several technical dimensions and human decisions.

I'm still at the beginning of this investigation.

I don't have a definitive formula for evaluating development agents, nor enough evidence to claim that my protocol is the best approach.

What I have is a process that has started to generate reusable knowledge.

And that is the idea I want to keep exploring in Developer OS:

**An Eval shouldn't serve only to decide whether a run passed or failed. It should turn each run into information that can improve the next one.**

---

*This article records the early stage of the study of Evals in Developer OS. The experiments are carried out on real missions of the project, with the goal of investigating governance, independent evaluation, and software quality in AI-agent-assisted workflows.*
