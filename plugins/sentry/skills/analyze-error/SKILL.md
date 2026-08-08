---
name: analyze-error
description: "Debug a production error end to end from a Sentry issue: read the events, stack and context, breadcrumbs, and values, then produce a diagnosis with a proposed next action. Use when asked to root-cause a production exception."
---

# Analyze a Production Error

Use this skill when an agent must root-cause a production error from its Sentry
events.

## Investigation order

Follow this order; it is the plugin's core value:

```
issue → events → stack/context → regression/change → trace/performance → next action
```

## Workflow

### 1. Issue overview

Fetch the issue: title, level, counts, first/last seen, culprit. Establish
whether it is a spike, a regression, or steady noise (use
`investigate-regression` if timing matters).

### 2. Events — pick representative samples

- Fetch the latest events and a few older ones.
- Compare: same message/frames across events, or drifting? (Drift suggests a
  changing input or a different code path.)

### 3. Stack and context

- Read the exception type, message, and the full stack trace. The **top
  application frame** (first non-framework frame) is the usual culprit; note
  the exact line.
- Read breadcrumbs for the sequence leading to the failure (request, DB calls,
  user actions).
- Check tags and contexts: release, environment, user, url, and any custom
  context the SDK attached.

### 4. Regression/change

- If the issue started at a release boundary, identify the likely commit (see
  `investigate-regression`).

### 5. Trace/performance

- If the error relates to latency or a downstream call, pull the trace (see
  `analyze-sentry-trace`).

### 6. Proposed next action

Produce the diagnosis and the narrowest next step: fix the identified line,
add input validation, handle a specific exception, pin a dependency, or roll
back. Mutating the issue (resolve/ignore/assign) requires explicit user intent.

### 7. Report

Give: the error summary (type/message), the decisive stack frame, the relevant
breadcrumb/context, the regression/performance evidence, the root cause with
the supporting evidence, and the proposed next action. Never invent values —
cite what the events show.

