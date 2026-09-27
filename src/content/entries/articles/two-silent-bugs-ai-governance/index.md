---
title: "Two silent bugs. One before the code existed, another after everything was green."
description: "Two silent bugs in Developer OS were caught at opposite stages: one during planning, before any code existed; another after tests, build, and deployment were already green. What these cases taught me about independent review and AI agent orchestration."
publishedAt: "2026-09-27"
---

# Two silent bugs. One before the code existed, another after everything was green.

There's a particularly comfortable feeling in software development when everything turns green.

Tests pass.  
Typecheck passes.  
The build finishes without errors.  
The app boots.  
The pages work.

It's tempting to read that set of signals as a conclusion:

**it's correct.**

While building Developer OS, two separate cases showed me why I try not to draw that conclusion.

In one of them, the code was already implemented and had gone through tests, build, deployment, and manual checks.

In the other, the code didn't exist yet.

Both hid a defect that could produce wrong results without necessarily throwing a visible error.

And both were caught at different points in the review process.

## Case 1 — Everything was green, but content could silently disappear

In September 2026, I was building **Projects v1**, the second content type in Developer OS.

The Blog already had a Markdown-based content pipeline. Projects would reuse only the parts that now had a second real consumer, while keeping the components specific to each content type separate.

The implementation was finished and went through a fairly thorough round of checks:

- automated tests;
- typecheck;
- build;
- deployment to Cloudflare;
- manual verification of the routes;
- inspection of the prerender output;
- checks on the build/runtime boundary;
- Blog regression tests.

Everything was green.

Then came the independent code review.

And it found a problem in the shared content-discovery mechanism.

### The problem

To decide whether a directory represented a valid content entry, the pipeline checked for the existence of an `index.md` using `statSync()`.

Simplified, the logic worked like this:

```text
try to stat index.md

on error:
    treat index.md as not existing
```

That looks reasonable for one specific case:

```text
ENOENT
→ index.md doesn't exist
→ this directory isn't an entry
```

But `ENOENT` isn't the only reason a filesystem operation can fail.

Errors like:

```text
EACCES
EIO
EMFILE
```

were also collapsed into `false`.

In practice:

```text
error accessing the file
→ false
→ content skipped
→ build keeps going
```

The problem wasn't simply an exception handled badly.

It was the opposite.

**The exception was handled too well.**

A real operational error could be read as a legitimate absence of content.

The build could finish successfully while an entry silently dropped out of the result.

### Why didn't the tests catch it?

Because every mechanism up to that point was answering a different question.

The tests checked the scenarios that had actually been written into them.

Typecheck checked type relationships.

The build checked whether the app could be produced at all.

Deployment checked whether the artifact worked along the paths that were exercised.

Manual checks confirmed pages and navigation behaved normally.

None of them asked:

**"What happens if the filesystem fails for a reason other than a missing file?"**

The code review did.

The fix was small:

```text
ENOENT
→ index.md genuinely doesn't exist
→ skip it

any other error
→ rethrow with context
→ fail the build
```

A dedicated test was also added to lock in that distinction.

There's one more detail worth noting about this case.

The defect wasn't introduced by Projects v1.

It already existed.

But Projects was generalizing the discovery module so it could serve both the Blog and Projects.

A silent failure that previously had a narrower blast radius was about to become shared infrastructure behavior.

That's exactly the moment the review caught it.

## Case 2 — The bug that was caught before it existed

Ten days later, something different happened.

I was planning **Analytics v1** for Developer OS.

The plan was to use GoatCounter for analytics, but there was an initialization problem to work out first.

The external script loads asynchronously.

That means a navigation can resolve before the analytics API is ready to record the pageview.

The system needed to hold onto those navigations and send them later, without losing events and without introducing incorrect deduplication.

During planning, a solution emerged: an ordered queue of pending paths.

It looked reasonable.

It even had what looked like a defensive safeguard:

**cap the queue at eight paths.**

That's where the independent plan review found the first problem.

### The ninth path

The contract stated that every pathname resolved before analytics became available had to be preserved, in order.

But the planned implementation capped the queue at eight elements.

So:

```text
path 1 → kept
path 2 → kept
...
path 8 → kept
path 9 → dropped
```

This wouldn't be a random loss.

It would be a deterministic loss, built into the algorithm itself.

And it would probably be hard to notice.

The dashboard would keep receiving data.

Some pages would get counted.

Others would just vanish.

The numbers would still look plausible.

### The problem was actually a bit worse than that

There was also a mix-up between two states:

```text
pending
```

and

```text
sent
```

The planned algorithm could advance the internal state marking a path as counted before confirming that path had actually been delivered to the local GoatCounter call.

That created a false internal truth:

```text
the app:
"I already sent this"

reality:
"I only queued it"
```

If that send was ever lost, or a flush failed, deduplication could then block any later retry.

The system wouldn't just lose the data point.

**It would believe it no longer needed to try sending it.**

Again, there was no crash involved, necessarily.

No necessarily visible error.

Analytics would simply end up incomplete.

### Except there was one fundamental difference

This bug never existed in code.

The branch didn't exist yet.

The PR didn't exist yet.

No provider account had been created for this implementation.

No runtime change had been made.

The defect existed only as a property of the algorithm described in the plan.

The review happened before implementation was even authorized.

The contract and the algorithm were corrected.

The queue lost its arbitrary drop policy.

`pending` and `sent` became semantically distinct states.

And an item could only leave the queue once the local `count(path)` call had returned successfully.

A test with at least ten pending paths was also written in, specifically to keep a similar arbitrary limit from creeping back in later.

The bug died in planning.

## Two bugs, two different moments

The two cases look similar because both involved silent failures.

But they were caught by different controls.

For Projects v1:

```text
implementation
→ tests
→ typecheck
→ build
→ deployment
→ manual checks
→ independent code review
→ defect found
```

For Analytics v1:

```text
contract
→ implementation plan
→ independent plan review
→ defect found
→ plan corrected
→ implementation hadn't even started
```

That changed how I think about review in Developer OS.

I used to associate review mostly with code.

Now I see at least two different questions.

Before implementation:

**Are we about to build the right decision?**

After implementation:

**Did the code actually preserve that decision and its guarantees?**

These are different problems.

And, because of that, different controls can catch different classes of error.

## "All green" doesn't mean the same thing as "correct"

None of this reduces the value of tests, CI, typecheck, or build.

Quite the opposite.

Each of them provides evidence about one specific property of the system.

The problem shows up when we treat a pile of partial evidence as a guarantee it never actually offered.

A passing test means the behavior it exercises passed.

A passing typecheck means certain type relationships hold.

A passing build means we could produce the artifact.

A working deployment means we could exercise certain paths of the system in that environment.

None of those statements automatically means:

**"There's no important class of behavior we forgot to check."**

That's one of the roles I've found for independent review.

Not to replace tests.

Not to replace execution.

Not to replace human judgment.

But to try to find the blind spots between them.

## Why independence matters

In Developer OS, the agent that implements and the agent that reviews carry different responsibilities.

The implementer has to build a coherent solution.

Along the way, it naturally builds a mental model of that solution.

That's necessary to execute well.

But the same mental model can also make some assumptions harder to see.

The reviewer starts from a different position.

It doesn't have to defend the decisions that led to the code.

It can compare contract, plan, implementation, tests, and guarantees as separate artifacts.

It can ask:

```text
why is this safe?
```

instead of just understanding:

```text
why was this built this way?
```

I don't think of this as a competition between agents.

The goal is **independent error detection**.

## What changes when a project is built with agents

There's another dimension to these two cases that I think matters.

Developer OS is, at its core, a solo project.

In a traditional flow, that means I'd likely be filling almost every role myself:

```text
I define the problem
↓
I design the solution
↓
I implement it
↓
I write the tests
↓
I validate it
↓
I review my own code
```

Nothing here suggests a human developer couldn't have found either of these bugs.

An experienced engineer could just as easily have spotted the wrong error-handling semantics on the filesystem side, or the state loss in the analytics algorithm.

The actual problem is different:

**whoever implements something also carries the assumptions that produced that implementation.**

Reviewing your own work doesn't automatically create a second perspective.

On a traditional team, part of this problem is solved by other people.

Another engineer reviews the PR.

An architectural decision gets discussed before implementation.

Someone who wasn't part of the original build can ask a question the author never thought to ask.

On a solo project, getting that kind of independence is usually harder.

This is where agent orchestration changed my workflow.

The process now looks more like this:

```text
human defines the problem and constraints
↓
agent investigates and plans
↓
a different agent reviews the plan
↓
human decides
↓
agent implements
↓
automated checks
↓
a different agent reviews the implementation
↓
human decides on the merge
```

None of this turns AI into a technical authority.

It also doesn't mean two agents are necessarily right just because they agree.

The decision stays human.

What changes is the cost of introducing **separation between authorship and review** into a project that would otherwise have exactly one developer.

And what makes these two cases interesting is that independent perspectives caught problems on opposite sides of the implementation.

On Analytics, the reviewer questioned a decision before it ever became code.

On Projects, the reviewer questioned an implementation after nearly every other check had already turned green.

To me, this might be one of the more interesting applications of AI agents in software engineering.

Not just writing code faster.

**Letting a solo developer work with something closer to a small engineering structure — as long as they stay accountable for the decisions, the contracts, and the evidence they choose to accept.**

## But this can also turn into bureaucracy

The most dangerous conclusion to draw from these cases would be to turn every change into a ritual of multiple reviews.

That's not what I'm trying to do here.

A small documentation tweak doesn't need to go through the same process as a change that touches:

- architecture;
- shared infrastructure;
- the filesystem;
- the boundary between build and runtime;
- artifact generation;
- guarantees that are hard to observe from a green build;
- behavior whose failure would still look like a valid result.

Projects v1 hit several of those criteria.

So did Analytics v1.

Review needs to be proportional to risk.

Otherwise, governance stops reducing risk and just starts adding cost.

## What these two cases changed in Developer OS

I can now sum up the idea in a fairly simple sequence:

```text
problem
↓
requirements / architecture
↓
plan
↓
independent plan review, when the risk justifies it
↓
human decision
↓
implementation
↓
PR
↓
independent code review, when the risk justifies it
↓
targeted fixes
↓
human merge decision
```

Plan review looks for wrong or incomplete decisions **before they become code**.

Code review looks for wrong or incomplete implementations **after the decision has been coded**.

Neither replaces tests.

Neither replaces human judgment.

And neither needs to exist just to satisfy process.

## The part that interests me most

The Projects case showed that an implementation can pass through a considerable amount of validation and still carry a silent defect.

The Analytics case showed something maybe even more interesting:

**the cheapest moment to fix a bug can be while it's still just a sentence in a plan.**

In the first case, governance stopped an operational error from silently turning into missing content.

In the second, it stopped an analytics strategy from starting its life already capable of losing data while internally believing it had been sent.

Neither bug ever reached production.

Which is exactly the problem with writing about them.

There's no screenshot of a broken page.

No outage postmortem.

No chart showing affected users.

There's just one considerably less dramatic thing:

**evidence that the process caught the problems while they were still cheap.**

And maybe that's exactly the kind of bug I'd rather have a story about.
