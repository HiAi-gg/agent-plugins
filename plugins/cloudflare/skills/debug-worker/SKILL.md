---
name: debug-worker
description: "Debug a Cloudflare Worker: check deployment state, inspect logs, find errors, and narrow the cause. Use when a Worker misbehaves, returns errors, or after a failed deploy."
---

# Debug a Cloudflare Worker

Use this skill when an agent must find out why a Cloudflare Worker is failing,
erroring, or behaving unexpectedly.

## Context

The Cloudflare MCP server uses a code-mode pattern: `search` (find endpoints in
the API spec) and `execute` (call the Cloudflare API). This skill is the
workflow that uses those tools to debug a Worker.

## Workflow

### 1. Confirm the target

- Identify the Worker name (and account/zone context if relevant).
- Confirm read access: the server needs OAuth or a token at the client level;
  say which mode you are operating in. Do not ask for tokens in conversation.

### 2. Check the deployment state

- Use `search` to find the Worker endpoints (e.g. `get_workers_script`,
  `list_workers_versions`).
- `execute` to fetch: current script version, deployed versions, and the
  latest deployment status. A failed/stuck deployment is a common cause.

### 3. Inspect logs and errors

- Find the Workers Logs / Tail endpoints via `search`.
- `execute` to fetch recent logs or exceptions for the Worker.
- Look for: uncaught exceptions, 5xx, binding errors (KV/D1/R2 misconfig),
  or build-time failures.

### 4. Narrow the cause

Classify:

- **Runtime error** — exception in the handler; correlate with the failing
  request/URL.
- **Deployment issue** — wrong version live, failed deploy, rollback needed.
- **Binding/config** — KV/D1/R2/Env binding name mismatch, missing secret.
- **Build** — the uploaded bundle failed to build (check deployment status).

### 5. Report

State: the Worker, its deployed version(s), the log/error evidence, the root
cause, and the narrowest fix (rollback, fix binding, fix the handler, redeploy).
Mutations (deploys, binding changes) require explicit user intent — this skill
is read-first.

## Guardrails

- Read-first: inspect deployments, logs, and versions; do not deploy, roll
  back, or edit bindings without explicit user intent.
- Do not print secrets, API tokens, or binding secret values.

