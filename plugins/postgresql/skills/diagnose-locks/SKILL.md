---
name: diagnose-locks
description: Diagnose PostgreSQL lock contention: detect blocked sessions, find the blocking session, identify the lock, and explain the cause. Use when queries hang, transactions stall, or the database appears stuck.
license: MIT
compatibility: Requires the postgresql MCP server bundled with this plugin and a DATABASE_URL at the client level.
metadata:
  plugin: postgresql
  kind: lock-diagnosis
---

# Diagnose PostgreSQL Locks

Use this skill when an agent must find out why sessions are blocked or
stalled.

## Workflow

### 1. Detect blocked sessions

Call `locks`. It returns blocked vs blocking PID pairs with relation, lock
type, and query ages. If empty, there are no lock waits right now — say so
explicitly (a negative result is meaningful).

### 2. Identify the blocking session

For each blocked → blocking pair:

- the blocking PID and what it is doing,
- the relation involved,
- the lock type and whether it was granted.

### 3. Check transaction age

Use `database_activity` to cross-reference:

- how old is the blocking transaction?
- is the blocker idle-in-transaction (holding locks while doing nothing)?
- how old is the blocked query?

### 4. Get the relevant queries

- The locks tool returns query excerpts for both sides.
- Cross-check with `database_activity` for the full context (wait events,
  application names).

### 5. Explain the cause

Common patterns:

- **Idle-in-transaction blocker** — a session finished work but never
  committed; it holds locks indefinitely.
- **Long-running writer** — an update/delete holding `RowExclusiveLock` while
  readers queue.
- **DDL contention** — `AccessExclusiveLock` (e.g. ALTER/TRUNCATE) blocking
  everything on the relation.
- **Lock ordering** — two sessions each holding a lock the other needs
  (deadlock is resolved by PostgreSQL automatically, but long waits can look
  similar).

### 6. Recommend safe remediation

- Present as **recommendations**, not automatic actions:
  - for an idle-in-transaction blocker: the application should commit or
    rollback; a human may terminate the backend (`pg_terminate_backend`) —
    this is a write/administrative action requiring explicit user intent.
  - for long-running writers: investigate the query; possibly increase
    `lock_timeout` handling on the app side.
  - for DDL contention: schedule DDL outside peak, use `LOCK TABLE` carefully.

## Guardrails

- Read-only: `locks` and `database_activity` only.
- **Never terminate sessions automatically.** Termination is an
  administrative action; recommend it, never execute it (the plugin has no
  such tool in v0.0.1).
