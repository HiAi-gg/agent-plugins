---
name: triage-sentry-issue
description: Triage a Sentry issue: assess impact, frequency, affected users, and severity from issue metadata, then recommend a priority. Use when asked what to fix first or whether a Sentry error is serious.
license: MIT
compatibility: Requires the sentry MCP server (hosted, OAuth via client) with access to the relevant Sentry organization.
metadata:
  plugin: sentry
  kind: triage
---

# Triage a Sentry Issue

Use this skill when an agent must decide how serious a Sentry issue is and
where it fits in the queue.

## Workflow

### 1. Gather issue metadata

Fetch the issue and record:

- title, level (error/fatal/warning), status, and age,
- event count and unique users (volume and reach),
- first seen / last seen (is it new, growing, or silent?),
- the primary culprit (file/function), and any assigned team/tag.

### 2. Assess impact

Build the triage picture:

- **Volume**: count + trend (rising/flat/falling) over the recent window.
- **Reach**: unique users affected and their share of active users.
- **Severity**: fatal/unhandled vs handled; does it affect a core flow?
- **Freshness**: new vs regressed (a regression changes the equation — see
  `investigate-regression`).

### 3. Assign priority

Propose a priority with the evidence:

- **P0/P1**: fatal, high volume or high-reach, core flow, or a regression.
- **P2**: recurring but contained error.
- **P3**: rare, cosmetic, or legacy path.

### 4. Recommend next action

- For high-priority: propose the investigation chain (`investigate-regression`
  → `analyze-sentry-trace` → `debug-production-error`).
- For low-priority: suggest grouping, ignoring, or scheduling — as a
  *recommendation*; mutating Sentry state (resolve, ignore, assign) is a write
  action requiring explicit user intent.

### 5. Report

Give: issue summary, impact metrics, priority with reasoning, and the
recommended next step. Keep mutation of issue state out unless asked.
