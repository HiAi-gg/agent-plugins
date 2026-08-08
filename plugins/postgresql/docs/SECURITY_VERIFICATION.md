# Security Verification

Verification date: 2026-08-07.
Method: real MCP client (JSON-RPC over stdio) driving the bundled HiAI
PostgreSQL MCP against Docker PostgreSQL containers.

## Critical read-only gate (19 cases)

Attempted through the MCP `query` tool. Expected: all writes rejected,
SELECT allowed.

| # | Statement | Result |
|---|---|---|
| 1 | `SELECT count(*) FROM app.users` | **ALLOWED** (rows returned) |
| 2 | `INSERT INTO app.users (email) VALUES ('hax@x.y')` | REJECTED |
| 3 | `UPDATE app.users SET name='hax' WHERE id=1` | REJECTED |
| 4 | `DELETE FROM app.users WHERE id=1` | REJECTED |
| 5 | `TRUNCATE app.users` | REJECTED |
| 6 | `CREATE TABLE hacked (id int)` | REJECTED |
| 7 | `ALTER TABLE app.users ADD COLUMN x int` | REJECTED |
| 8 | `DROP TABLE app.orders` | REJECTED |
| 9 | `CREATE EXTENSION hstore` | REJECTED |
| 10 | `CREATE ROLE hacker` | REJECTED |
| 11 | `GRANT ALL ON app.users TO public` | REJECTED |
| 12 | `REVOKE SELECT ON app.users FROM public` | REJECTED |
| 13 | `COPY app.users TO PROGRAM 'rm -rf /tmp/x'` | REJECTED |
| 14 | `SELECT 1; DELETE FROM app.users` (multi-statement) | REJECTED |
| 15 | `BEGIN` | REJECTED |
| 16 | `SET default_transaction_read_only = off` | REJECTED |
| 17 | `SET statement_timeout = 0` | REJECTED |
| 18 | `SELECT * INTO hacked FROM app.users` | REJECTED |
| 19 | `ANALYZE app.users` | REJECTED |

**All 19 cases behave as expected.**

> Note: case 18 (`SELECT INTO`) initially exposed a real bug: per-session
> `set_config` did not apply to every pooled connection, so the first attempt
> created a table. Fixed by moving read-only enforcement into the connection
> options (`buildSafeUrl`) so PostgreSQL applies it to **every** pooled
> connection. Re-verified: rejected, and no `hacked` table exists after the
> fix.

## Version matrix

| PostgreSQL | Safe tools | Writes | Result |
|---|---|---|---|
| 14 (docker, alpine) | database_info, list_tables, query OK | all rejected | PASS |
| 16 (docker, alpine) | all 13 tools OK | all rejected | PASS |

## Credential gate

| Scenario | Behavior |
|---|---|
| wrong password | `password authentication failed for user "postgres"` — no password in output |
| unavailable host | `Connection closed` — no URL/credentials in output |
| malformed URL (`not-a-url`) | `Connection closed` — no crash, no credential leak |
| stderr scan | 0 occurrences of the actual password in stderr |

## pg_stat_statements absence

Environment without `pg_stat_statements`:

```json
{ "available": false, "reason": "pg_stat_statements is not installed or accessible" }
```

Plugin continues to work; `slow_queries` degrades gracefully.

## Safe operations verified

- `SELECT` with parameters and limits.
- Catalog inspection (`list_schemas`, `list_tables`, `describe_table`,
  `list_indexes`).
- `EXPLAIN (FORMAT JSON)` (statement not executed).
- Monitoring views (`database_activity`, `locks`, `table_health`,
  `database_sizes`, `health_summary`).
- `slow_queries` with `pg_stat_statements` enabled.

## Unit tests

`packages/postgres-mcp/tests/query-safety.test.ts`: 11 tests covering single-
statement enforcement, forbidden keywords, `SELECT INTO`, and false-positive
avoidance (`SELECT ... WHERE a IN (...)`).
