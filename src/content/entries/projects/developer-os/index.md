---
title: Developer OS
description: A public engineering lab where software architecture, AI-assisted development, and human-in-the-loop decision-making are documented as they happen, not cleaned up after the fact.
technologies:
  - TypeScript
  - React
  - TanStack Start
  - Tailwind CSS
  - Cloudflare Workers
repositoryUrl: https://github.com/HrqHmk/developer-os
---

## What it is

Developer OS is this site — a public engineering lab, not a portfolio. Every page you can navigate to, including this one, is content and code versioned in the same repository, built by the same pipeline, and shipped through the same review process described below.

## Why I'm building it

Most project write-ups show a finished result and leave out the decisions that led there. This one doesn't. The specification, the architecture decisions, and the trade-offs behind every feature are recorded before the code exists, not reconstructed afterward for presentation.

## How it works

Content — this page included — is versioned Markdown with a validated frontmatter contract, discovered and compiled entirely at build time. Nothing here is fetched, parsed, or rendered from Markdown at request time: what ships is already-processed HTML, served as a static artifact.

## Engineering approach

Claude and Codex write and review most of the code; every architectural decision that isn't already documented stops for human approval before it's implemented. Every change enters through a Pull Request, reviewed by a human before merge — the depth of that review scales with what's at stake, but it never drops to zero.

## Current state

Home, About, and Blog are live. This Projects page is the newest addition. CI/CD automation is still in progress — the build is verified on every change, but deploy remains a manual step for now.
