---
name: debug-web-ui
description: "Debug a web UI problem in a real browser with agent-browser: reproduce, read the page state, isolate the failing element or interaction, and report the root cause. Use when a page looks wrong, an interaction misbehaves, or a UI bug needs root-causing."
---

# Debug a Web UI

Use this skill when an agent must find the root cause of a web UI problem using
the agent-browser CLI.

## Workflow

### 1. Reproduce

- Get the URL and the steps that trigger the problem.
- `agent-browser open "<url>"`, then follow the user's steps with `click` /
  `fill` / `press`.
- If it does not reproduce, vary the obvious dimensions (URL params, viewport,
  logged-in state) and say what you tried.

### 2. Observe the failing state

- `agent-browser read` at the failing moment — the snapshot shows what is
  actually rendered.
- Compare against what should be present: missing element, wrong content, or
  an unresponsive control.

### 3. Isolate the cause

For each candidate, do the smallest check:

- Missing content → is the element absent, empty, or hidden?
- Interaction dead → does the control appear in the snapshot with a ref?
- Page error → look for error text in the snapshot or a blank/partial render.
- Timing → reload (`agent-browser open` again) — does the outcome change
  (race/cache)?

### 4. Report

State: reproduction steps, the observed state (snapshot evidence), the most
likely root cause, and the narrowest fix. If intermittent, say so and describe
what you tried.

## Guardrails

- Debugging is read-observation: use `read` first, interact only to reproduce.
- Do not submit forms or mutate data as part of diagnosis unless required and
  authorized.
- Close the browser session when done.

