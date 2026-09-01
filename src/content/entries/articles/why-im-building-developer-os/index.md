---
title: Why I'm Building Developer OS
description: What Developer OS is for, why AI agents write most of the code here under my review, and why the process is documented as openly as the output.
publishedAt: 2026-09-04
---

Developer OS started as a simple question: what if the way I build software was itself the thing worth sharing, not just what got shipped?

Most portfolios show a finished result and hide the decisions that led there. I wanted the opposite. Every architectural choice in this project lives in the open — as documentation before code, as a GitHub Issue before a branch, as a diff a human reviews before it merges. The commit history isn't cleaned up to look tidier than the work actually was. If a decision got revised two weeks later, the ADR that replaced it says so, and the old one stays on record instead of being quietly rewritten.

## AI as orchestration, not autopilot

A lot of what gets called "AI-assisted development" really means: describe what you want, get a diff, merge it. That's not what happens here. Claude does most of the typing, but the shape of the work — what problem we're solving, which trade-offs are acceptable, where the architectural line sits — comes from a specification written before any code exists. An agent that hits a decision the specification doesn't cover is expected to stop and ask, not guess and continue. That expectation is written into the project's own instructions, not just hoped for.

The distinction matters because the two produce different software. Autopilot optimizes for a plausible-looking diff. Orchestration optimizes for a system whose author — human — can still explain why it looks the way it does, six months later.

## Human-in-the-loop is a checkpoint, not a formality

Every change enters through a Pull Request, and a Pull Request only merges after a human reads it — the depth of that reading scales with what's at stake, but it never drops to zero. Architectural decisions belong to the person, not the model: when something isn't already decided in the docs, the agent's job is to lay out the alternatives and their trade-offs and wait, not to pick one silently. That's not a safety net bolted on after the fact. It's the actual mechanism by which this project stays coherent instead of drifting one plausible-sounding diff at a time.

## Learning from the project's own decisions

I didn't write the architecture docs first and then never touch them again. They're revised as real constraints show up — a redirect behavior that only appeared after a real deploy, a caching assumption that turned out to be wrong once actually tested. Each of those became a documented, dated finding instead of a silent fix. That's deliberate: the project is as much a record of what I got wrong and corrected as it is a record of what works. Reading the ADRs in order is closer to reading a lab notebook than a spec sheet.

That's also why "simple until proven insufficient" keeps showing up as a working principle instead of a slogan. It's tempting to reach for the more sophisticated solution up front. Developer OS is set up to make that expensive on purpose — every abstraction has to justify itself against a concrete need already in front of it, not a hypothetical one.

## Why build in public at all

Because the parts of engineering that are hardest to learn from a finished product are exactly the parts a finished product hides: what didn't work, what got reconsidered, how a disagreement between two independent reviews actually got resolved. Publishing the process is slower than publishing only the result. I think it's the more useful thing to leave behind.

This post is itself an example: the first real piece of content to go through the Markdown pipeline this project just built, validated at build time, with no exceptions carved out for its own launch.
