---
name: diagnose-performance
description: Diagnose PostgreSQL performance issues: active sessions, long transactions, locks, table health, sizes, and pg_stat_statements. Use when the database is slow, under load, or when asked for a performance investigation.
license: MIT
compatibility: Requires the postgresql MCP server bundled with this plugin and a DATABASE_URL at the client level.
metadata:
  plugin: postgresql
  kind: performance-diagnosis
---

# Diagnose PostgreSQL Performance

Use this skill when an agent must investigate database-wide performance.

## Workflow

### 1. Activity

Call `database_activity`:

- active sessions and their queries,
- idle-in-transaction sessions (a common blocker),
- long-running queries and transaction ages,
- wait events.

### 2. Long transactions

- From the activity data, identify sessions with large `transaction_age`.
- Long-open transactions hold locks and bloat the snapshot — they are a
  frequent root cause of apparent slowness elsewhere.

### 3. Locks

Call `locks`: blocked vs blocking sessions, relations, lock modes, query
ages. If waits exist, this is the immediate cause of stalls — see
`diagnose-locks`.

### 4. Table health

Call `table_health` for the hot tables: `n_dead_tup`, last vacuum/analyze.
High dead-tuple counts with stale autovacuum affect update/delete workloads.

### 5. Sizes

Call `database_sizes`: database size, largest tables/indexes. Oversized
relations explain scan cost.

### 6. pg_stat_statements (if available)

Call `slow_queries` for the top statements by total time. This is the best
evidence for "which queries cost the most" — but only when the extension is
installed. If it returns `available: false`, say so; do not treat the absence
as a finding.

### 7. Prioritized findings

Present findings ranked by impact:

- **Blocking now** (locks, idle-in-transaction) — with evidence.
- **Consuming the most** (top statements by time/calls) — with evidence.
- **Degrading over time** (dead tuples, no recent analyze) — with evidence.
- Hypotheses (e.g. "probably index-related") clearly marked as hypotheses,
  not facts.

## Guardrails

- Read-only: activity, locks, health, sizes, and stats only.
- Distinguish evidence (tool output) from hypotheses in every finding.
- Never recommend `VACUUM FULL` or `pg_terminate_backend` as automatic
  actions; propose them only as recommendations requiring user intent.
