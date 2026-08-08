---
name: test-web-flow
description: "Walk a multi-step user flow in a real browser with agent-browser: navigate, fill, submit, verify each step, and report results. Use when asked to verify a signup, checkout, onboarding, or other multi-step web flow."
---

---
name: test-web-flow
description: Walk a multi-step user flow in a real browser with agent-browser: navigate, fill, submit, verify each step, and report results. Use when asked to verify a signup, checkout, onboarding, or other multi-step web flow.
license: MIT
compatibility: Requires the agent-browser CLI (v0.31.x) with Chrome for Testing installed.
metadata:
  plugin: agent-browser
  kind: flow-testing
---

# Test a Multi-Step Web Flow

Use this skill when an agent must verify that a multi-step user journey works
end to end in a real browser.

## Workflow

### 1. Map the flow

- Write out the steps (e.g. home → form → submit → confirmation).
- Note side effects (accounts, orders, emails) and flag them to the user
  before running. Only run flows with side effects after explicit consent.

### 2. Set up

- `agent-browser doctor` (install browser if missing).
- `agent-browser open "<start-url>"`, then `agent-browser read` to orient.

### 3. Execute step by step

For each step:

- interact: `click`, `fill`, `type`, `press` (use refs from the last snapshot),
- verify: `agent-browser read` — confirm the expected next state appeared
  before continuing.
- Stop at the first failed step; do not proceed on a broken flow.

### 4. Verify the end state

- Confirm the final confirmation state via `agent-browser read`.
- Report: each step passed/failed with evidence, side effects created (order
  ids, accounts), and anything you skipped (e.g. real payment).

### 5. Close

- `agent-browser close` when done.

## Guardrails

- Side-effect flows require explicit user consent first.
- Use test data and test accounts only; never real credentials or payment
  details.
- Never print credentials, tokens, or cookies into responses.

