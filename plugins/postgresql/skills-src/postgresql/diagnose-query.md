---
name: diagnose-query
description: Diagnose why a PostgreSQL query is slow or suspicious: understand the SQL, inspect tables and indexes, EXPLAIN JSON, and propose measured next steps. Use when a query is slow, timing out, or has a suspicious plan.
license: MIT
compatibility: Requires the postgresql MCP server bundled with this plugin and a DATABASE_URL at the client level.
metadata:
  plugin: postgresql
  kind: query-diagnosis
---

# Diagnose a PostgreSQL Query

Use this skill when an agent must explain why a query is slow or producing a
surprising result.

## Workflow

### 1. Understand the SQL

- Restate what the query does: tables, joins, filters, grouping, ordering.
- Note the key columns used in `WHERE`, `JOIN`, `ORDER BY`.

### 2. Inspect the involved tables

- `describe_table` for each table: column types, PK, FKs, constraints.
- Note row-count context from `table_health` (live tuples) — not an exact
  count, but a scale signal.

### 3. Inspect indexes

- `list_indexes` for each table. Check whether the filter/join/order columns
  are indexed.
- Do **not** recommend an index blindly — a `Seq Scan` on a small table is
  fine; the optimizer is usually right for small inputs.

### 4. EXPLAIN JSON

- Call `explain_query` with the statement (`EXPLAIN (FORMAT JSON, VERBOSE)` —
  **not executed**).
- Read the plan top-down: node types, estimated vs actual row counts (when
  available), join order, sort/hash operations.

### 5. Check statistics

- `table_health` for the involved tables: `n_dead_tup`, `last_analyze`,
  `last_autoanalyze`. Stale statistics explain bad estimates.
- Compare estimated vs actual rows if the plan exposes both — large
  misestimates point at missing `ANALYZE` or wrong correlation assumptions.

### 6. Explain likely causes

Rank causes by evidence:

- missing index on a large-table filter/join (only if the plan shows a
  `Seq Scan` on a large relation),
- stale statistics (bad estimates, `last_analyze` old),
- plan shape (nested loop vs hash join on skewed data),
- wide rows / `SELECT *` fetching more than needed,
- query patterns (functions on indexed columns defeating index use,
  `LIKE '%...'`).

### 7. Propose measured next steps

- Concrete, testable recommendations: add index X (as a suggestion), run
  `ANALYZE` (a write-adjacent operation — requires explicit user intent; the
  plugin has no write tools in v0.0.1), rewrite a specific predicate.
- Say what each change would change in the plan.

## Guardrails

- Read-only: `explain_query` does not execute the statement.
- Never suggest `VACUUM FULL`, `REINDEX`, or schema changes as automatic
  actions — only as recommendations requiring user action.
