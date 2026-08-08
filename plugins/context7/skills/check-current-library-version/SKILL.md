---
name: check-current-library-version
description: Check the current stable version of a library or framework and what changed recently, before recommending upgrades or writing version-sensitive code. Use when a version bump is proposed, when troubleshooting a version-specific bug, or when the project's pinned version looks old.
---

# Check Current Library Version

Use this skill when the current version of a library matters: upgrade
discussions, bug triage, or compatibility decisions.

## Workflow

### 1. Establish the question

- Which package, and which version does the project currently pin (manifest +
  lockfile)?
- What is the decision: upgrade? pin? is the bug fixed upstream?

### 2. Get current versions

- Query Context7 for the package to learn the current stable version.
- If available, note the version history relevant to the question (the version
  that fixed a bug, introduced a breaking change, or became EOL).

### 3. Compare and advise

- State the gap: current pinned → latest stable, with major/minor/patch deltas.
- If an upgrade is proposed, check what changed between the versions in question
  (breaking changes, deprecations) — do not recommend a blind bump.
- If troubleshooting, note whether the pinned version predates a known fix.

### 4. Report

Give: package, pinned version, latest stable, the relevant change notes, and a
recommendation (upgrade / stay / pin different) with the reasoning tied to the
changes you found.

## Guardrails

- Research only. Do not edit manifests or run installs unless the user asks.
- Do not claim a version is "latest" beyond what the docs/registry say — say how
  current your source is.

