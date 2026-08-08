---
name: review-database-health
description: "Produce a compact PostgreSQL health review: configuration signals, capacity, maintenance, locks/activity, large relations, and query statistics. Use when asked for an overall database health assessment or a pre-maintenance check."
license: MIT
compatibility: Requires the postgresql MCP server bundled with this plugin and a DATABASE_URL at the client level.
metadata:
  plugin: postgresql
  kind: health-review
---

# Review PostgreSQL Database Health

Use this skill when an agent must produce a compact, evidence-based health
review of a database.

## Workflow

### 1. Identity and configuration

Call `database_info`:

- version, database, user,
- read-only status and timeouts (confirm the safety posture is active),
- installed extensions,
- connection (redacted).

### 2. Capacity

Call `database_sizes`:

- database size,
- largest tables and indexes.

### 3. Maintenance signals

Call `table_health` for the largest/important tables:

- live vs dead tuples,
- last vacuum / autovacuum / analyze / autoanalyze.

Frame these as **maintenance signals**, not precise diagnoses — do not invent
a "bloat %".

### 4. Locks and activity

Call `database_activity` and `locks`:

- active sessions, idle-in-transaction,
- long transactions,
- lock waits (blocked vs blocking).

### 5. Query statistics (if available)

Call `slow_queries`:

- top statements by total time.
- If `available: false`, state that pg_stat_statements is not installed —
  that is a capability note, not a finding.

### 6. Risks and recommended next checks

Summarize:

- **Configuration signals**: timeouts, read-only, extensions.
- **Capacity**: size, largest relations.
- **Maintenance**: dead tuples, stale analyze (signal).
- **Locks/activity**: current waits, long transactions.
- **Large relations**: oversized tables/indexes.
- **Query stats**: top consumers (when available).

List risks ranked by impact, each with the evidence, and the recommended next
checks (e.g. "investigate the idle-in-transaction session via
`diagnose-locks`").

## Guardrails

- Read-only: all tools are inspection tools.
- This is a health *review* — it does not replace a DBA or a full monitoring
  system. Say so in the summary.
- Never recommend mutating actions as automatic steps; only as
  recommendations requiring user intent.

